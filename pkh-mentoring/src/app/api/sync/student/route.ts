import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  StudentStatus,
  PaymentStatus,
  PaymentMethod,
  PaymentPlan,
  ActivityType,
} from "@prisma/client";

// ─── Types ─────────────────────────────────────────────────────────

interface SyncPayload {
  timestamp?: string | null;
  closerName?: string | null;
  closerEmail?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  programme?: string | null;
  extraMonths?: string | null;
  specialAgreement?: string | null;
  totalSalesPrice?: number | null;
  frontEndPrice?: number | null;
  backEndPrice?: number | null;
  cashCollected?: number | null;
  paidVia?: string | null;
  secondPaymentDue?: string | null;
  secondPaymentAmount?: number | null;
  thirdPaymentDue?: string | null;
  thirdPaymentAmount?: number | null;
  description?: string | null;
  studentNumber?: string | null;
  paymentMade?: boolean | null;
  paidAt?: string | null;
  amountReceived?: number | null;
  paymentMethod?: string | null;
  paymentRef?: string | null;
}

// ─── Helpers ───────────────────────────────────────────────────────

function mapPaymentMethod(raw: string | null | undefined): PaymentMethod | null {
  if (!raw) return null;
  const normalised = raw.trim().toLowerCase();
  if (normalised === "stripe") return PaymentMethod.STRIPE;
  if (normalised === "bank transfer") return PaymentMethod.BANK_TRANSFER;
  if (normalised === "cash") return PaymentMethod.CASH;
  if (normalised === "paypal") return PaymentMethod.PAYPAL;
  return PaymentMethod.OTHER;
}

function detectPaymentPlan(data: SyncPayload): PaymentPlan {
  if (!data.backEndPrice || data.backEndPrice === 0) return PaymentPlan.FULL;
  if (data.thirdPaymentAmount && data.thirdPaymentAmount > 0) return PaymentPlan.SPLIT_3;
  if (data.secondPaymentAmount && data.secondPaymentAmount > 0) return PaymentPlan.SPLIT_2;
  return PaymentPlan.CUSTOM;
}

function parseDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim();

  // Try MM/DD/YYYY or MM/DD/YYYY HH:MM:SS format (Google Sheets timestamp)
  const slashMatch = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}):?(\d{2})?)?$/
  );
  if (slashMatch) {
    const [, month, day, year, hours, minutes, seconds] = slashMatch;
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      hours ? parseInt(hours) : 0,
      minutes ? parseInt(minutes) : 0,
      seconds ? parseInt(seconds) : 0
    );
    if (!isNaN(date.getTime())) return date;
  }

  // Fallback to native Date parse (handles ISO strings, etc.)
  const fallback = new Date(trimmed);
  if (!isNaN(fallback.getTime())) return fallback;

  return null;
}

function countPaymentInstalments(data: SyncPayload): number {
  let count = 1; // Front-end payment always counts
  if (data.secondPaymentAmount && data.secondPaymentAmount > 0) count++;
  if (data.thirdPaymentAmount && data.thirdPaymentAmount > 0) count++;
  return count;
}

function buildNotesAppend(data: SyncPayload): string {
  const parts: string[] = [];
  if (data.description?.trim()) parts.push(data.description.trim());
  if (data.extraMonths?.trim()) parts.push(`Extra months: ${data.extraMonths.trim()}`);
  return parts.join("\n");
}

// ─── POST Handler ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: SyncPayload = await request.json();

    // Validate required fields
    if (!body.email?.trim() && (!body.firstName?.trim() || !body.lastName?.trim())) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: email or firstName + lastName required" },
        { status: 400 }
      );
    }

    const email = body.email?.trim().toLowerCase() || null;

    // ─── 1. MATCH STUDENT ────────────────────────────────────────────

    let student = null;
    let action: "enriched" | "created" = "enriched";

    // a. Search by email
    if (email) {
      student = await prisma.student.findUnique({
        where: { email },
      });
    }

    // b. Fallback: search by firstName + lastName
    if (!student && body.firstName?.trim() && body.lastName?.trim()) {
      student = await prisma.student.findFirst({
        where: {
          firstName: { equals: body.firstName.trim(), mode: "insensitive" },
          lastName: { equals: body.lastName.trim(), mode: "insensitive" },
        },
      });
    }

    // c. Check for studentNumber conflict
    if (body.studentNumber?.trim()) {
      const existingWithNumber = await prisma.student.findUnique({
        where: { studentNumber: body.studentNumber.trim() },
      });

      if (existingWithNumber && student && existingWithNumber.id !== student.id) {
        return NextResponse.json(
          {
            success: false,
            error: `Student number ${body.studentNumber} already assigned to different student (${existingWithNumber.email})`,
          },
          { status: 409 }
        );
      }
    }

    // ─── 2. HANDLE CLOSER ───────────────────────────────────────────

    let closerId: string | null = null;

    if (body.closerName?.trim()) {
      const closerName = body.closerName.trim();

      // Search by name (case-insensitive)
      let closer = await prisma.closer.findFirst({
        where: { name: { equals: closerName, mode: "insensitive" } },
      });

      if (closer) {
        // Update email if provided and currently null
        if (body.closerEmail?.trim() && !closer.email) {
          closer = await prisma.closer.update({
            where: { id: closer.id },
            data: { email: body.closerEmail.trim().toLowerCase() },
          });
        }
        closerId = closer.id;
      } else {
        // Create new Closer
        closer = await prisma.closer.create({
          data: {
            name: closerName,
            email: body.closerEmail?.trim().toLowerCase() || null,
          },
        });
        closerId = closer.id;
      }
    }

    // ─── 3. FIND OR CREATE PROGRAMME ────────────────────────────────

    let programmeId: string | null = null;

    if (body.programme?.trim()) {
      const programmeName = body.programme.trim();

      let programme = await prisma.programme.findFirst({
        where: { name: { equals: programmeName, mode: "insensitive" } },
      });

      if (!programme) {
        programme = await prisma.programme.create({
          data: { name: programmeName },
        });
      }

      programmeId = programme.id;
    }

    // ─── 4. CREATE OR ENRICH STUDENT ────────────────────────────────

    const saleDate = parseDate(body.timestamp);
    const paymentPlan = detectPaymentPlan(body);
    const notesAppend = buildNotesAppend(body);

    if (!student) {
      // CREATE new student as PROSPECT
      action = "created";

      if (!email) {
        return NextResponse.json(
          { success: false, error: "Email is required to create a new student" },
          { status: 400 }
        );
      }

      student = await prisma.student.create({
        data: {
          firstName: body.firstName?.trim() || "Unknown",
          lastName: body.lastName?.trim() || "Unknown",
          email,
          phone: body.phone?.trim() || null,
          studentNumber: body.studentNumber?.trim() || null,
          status: StudentStatus.PROSPECT,
          totalAmount: body.totalSalesPrice ?? null,
          depositAmount: body.frontEndPrice ?? null,
          paymentPlanType: paymentPlan,
          closerId,
          saleDate,
          programmeId,
          notes: notesAppend || null,
        },
      });
    } else {
      // ENRICH existing student
      const existingNotes = student.notes || "";
      const updatedNotes =
        notesAppend && existingNotes
          ? `${existingNotes}\n${notesAppend}`
          : notesAppend || existingNotes || null;

      student = await prisma.student.update({
        where: { id: student.id },
        data: {
          studentNumber: body.studentNumber?.trim() || student.studentNumber,
          totalAmount: body.totalSalesPrice ?? student.totalAmount,
          depositAmount: body.frontEndPrice ?? student.depositAmount,
          paymentPlanType: paymentPlan,
          closerId: closerId || student.closerId,
          saleDate: saleDate || student.saleDate,
          programmeId: programmeId || student.programmeId,
          notes: updatedNotes,
          // Update phone if provided and student doesn't have one
          phone: student.phone || body.phone?.trim() || null,
        },
      });
    }

    // ─── 5. CREATE/UPDATE PAYMENT RECORDS ───────────────────────────

    const totalInstalments = countPaymentInstalments(body);

    // Front-end payment (instalment 1)
    const frontEndAmount = body.amountReceived ?? body.frontEndPrice;
    if (frontEndAmount && frontEndAmount > 0) {
      const existingPayment1 = await prisma.payment.findUnique({
        where: {
          studentId_instalmentNumber: {
            studentId: student.id,
            instalmentNumber: 1,
          },
        },
      });

      const payment1Data = {
        amount: frontEndAmount,
        method: mapPaymentMethod(body.paymentMethod || body.paidVia),
        status: body.paymentMade
          ? PaymentStatus.COMPLETED
          : PaymentStatus.PENDING,
        paidAt: body.paymentMade ? parseDate(body.paidAt) : null,
        reference: body.paymentRef?.trim() || null,
        instalmentNumber: 1,
        totalInstalments,
      };

      if (existingPayment1) {
        await prisma.payment.update({
          where: { id: existingPayment1.id },
          data: payment1Data,
        });
      } else {
        await prisma.payment.create({
          data: {
            studentId: student.id,
            ...payment1Data,
          },
        });
      }
    }

    // 2nd payment
    if (body.secondPaymentAmount && body.secondPaymentAmount > 0) {
      const existingPayment2 = await prisma.payment.findUnique({
        where: {
          studentId_instalmentNumber: {
            studentId: student.id,
            instalmentNumber: 2,
          },
        },
      });

      const payment2Data = {
        amount: body.secondPaymentAmount,
        method: null as PaymentMethod | null,
        status: PaymentStatus.PENDING,
        instalmentNumber: 2,
        totalInstalments,
        notes: body.secondPaymentDue?.trim() || null,
      };

      if (existingPayment2) {
        await prisma.payment.update({
          where: { id: existingPayment2.id },
          data: payment2Data,
        });
      } else {
        await prisma.payment.create({
          data: {
            studentId: student.id,
            ...payment2Data,
          },
        });
      }
    }

    // 3rd payment
    if (body.thirdPaymentAmount && body.thirdPaymentAmount > 0) {
      const existingPayment3 = await prisma.payment.findUnique({
        where: {
          studentId_instalmentNumber: {
            studentId: student.id,
            instalmentNumber: 3,
          },
        },
      });

      const payment3Data = {
        amount: body.thirdPaymentAmount,
        method: null as PaymentMethod | null,
        status: PaymentStatus.PENDING,
        instalmentNumber: 3,
        totalInstalments,
        notes: body.thirdPaymentDue?.trim() || null,
      };

      if (existingPayment3) {
        await prisma.payment.update({
          where: { id: existingPayment3.id },
          data: payment3Data,
        });
      } else {
        await prisma.payment.create({
          data: {
            studentId: student.id,
            ...payment3Data,
          },
        });
      }
    }

    // ─── 6. CREATE ARRANGEMENT ──────────────────────────────────────

    if (body.specialAgreement?.trim()) {
      // Check if arrangement with same description already exists for student
      const existingArrangement = await prisma.arrangement.findFirst({
        where: {
          studentId: student.id,
          description: body.specialAgreement.trim(),
        },
      });

      if (!existingArrangement) {
        await prisma.arrangement.create({
          data: {
            studentId: student.id,
            description: body.specialAgreement.trim(),
            agreedDate: saleDate || new Date(),
            notes: body.closerName
              ? `Agreed by: ${body.closerName.trim()}`
              : null,
            isResolved: false,
          },
        });
      }
    }

    // ─── 7. CREATE ACTIVITY LOG ─────────────────────────────────────

    await prisma.activityLog.create({
      data: {
        studentId: student.id,
        type: ActivityType.SALE_DATA_SYNCED,
        description: `Sale data synced from Google Sheet${body.studentNumber ? ` — Student number: ${body.studentNumber.trim()}` : ""}`,
        metadata: {
          source: "google_sheet_sync",
          studentNumber: body.studentNumber?.trim() || null,
          action,
          closerName: body.closerName?.trim() || null,
        },
      },
    });

    // ─── 8. RETURN RESPONSE ─────────────────────────────────────────

    return NextResponse.json({
      success: true,
      action,
      studentId: student.id,
      studentNumber: student.studentNumber,
    });
  } catch (error) {
    console.error("Sync student error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
