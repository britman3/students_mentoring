import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ActivityType, StudentStatus } from "@prisma/client";
import { customAlphabet } from "nanoid";
import { assignStudentToSlot } from "@/lib/assignment";
import { getLastCallDate, formatUKDate } from "@/lib/dates";
import { getDayName, formatDisplayTime } from "@/lib/display";
import { sendConfirmationEmail } from "@/lib/email";
import { sendSlackNotification } from "@/lib/slack";

const generateJoinCode = customAlphabet(
  "abcdefghijklmnopqrstuvwxyz0123456789",
  6
);

interface EnrolBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  slotId?: string;
  closerName?: string;
  waitlistSlotId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EnrolBody = await request.json();

    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim();
    const slotId = body.slotId?.trim();
    const closerName = body.closerName?.trim() || null;
    const waitlistSlotId = body.waitlistSlotId?.trim() || null;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !slotId) {
      return NextResponse.json(
        { error: "All fields are required: firstName, lastName, email, phone, slotId" },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existingStudent = await prisma.student.findUnique({
      where: { email },
      include: {
        slotInstance: {
          include: { slot: true },
        },
      },
    });

    if (existingStudent && existingStudent.slotInstance) {
      const settings = await prisma.settings.findFirst();
      const slot = existingStudent.slotInstance.slot;
      const dayTime = `${getDayName(slot.dayOfWeek)} ${formatDisplayTime(slot.time)}`;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3099";

      return NextResponse.json({
        success: true,
        alreadyEnrolled: true,
        confirmation: {
          firstName: existingStudent.firstName,
          dayTime,
          firstCallDate: existingStudent.firstCallDate
            ? formatUKDate(existingStudent.firstCallDate)
            : null,
          lastCallDate: existingStudent.firstCallDate
            ? formatUKDate(getLastCallDate(existingStudent.firstCallDate))
            : null,
          groupCode: existingStudent.slotInstance.groupCode,
          joinCode: existingStudent.joinCode,
          joinLink: `${appUrl}/join/${existingStudent.joinCode}`,
          showGroupCodes: settings?.showGroupCodes ?? false,
        },
      });
    }

    // Handle closer
    let closerId: string | null = null;
    if (closerName) {
      let closer = await prisma.closer.findFirst({
        where: { firstName: { equals: closerName, mode: "insensitive" } },
      });

      if (!closer) {
        closer = await prisma.closer.create({
          data: { firstName: closerName },
        });
      }

      closerId = closer.id;
    }

    // Generate unique joinCode
    let joinCode = generateJoinCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.student.findUnique({ where: { joinCode } });
      if (!existing) break;
      joinCode = generateJoinCode();
      attempts++;
    }

    // Run auto-assignment to get the less-full week instance
    const assignment = await assignStudentToSlot(slotId);

    // Get settings for capacity etc
    const settings = await prisma.settings.findFirst();

    // Get slot details
    const slot = await prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    // Create student record
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        slotInstanceId: assignment.slotInstanceId,
        firstCallDate: assignment.firstCallDate,
        joinCode,
        closerId,
        status: StudentStatus.SLOT_SELECTED,
        enrolmentDate: new Date(),
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        studentId: student.id,
        type: ActivityType.SLOT_ASSIGNED,
        title: "Slot assigned via enrolment",
        createdByType: "system",
      },
    });

    // Handle waitlist
    if (waitlistSlotId && waitlistSlotId !== slotId) {
      try {
        // Find the less-full instance for the waitlist slot
        const waitlistAssignment = await assignStudentToSlot(waitlistSlotId);

        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 2);

        await prisma.waitlistEntry.create({
          data: {
            studentId: student.id,
            slotInstanceId: waitlistAssignment.slotInstanceId,
            expiresAt,
            status: "WAITING",
          },
        });

        await prisma.activityLog.create({
          data: {
            studentId: student.id,
            type: ActivityType.WAITLIST_JOINED,
            title: "Joined waitlist",
            createdByType: "system",
          },
        });
      } catch {
        // Waitlist failure should not block enrolment
        console.warn("Failed to create waitlist entry, continuing without it");
      }
    }

    // Format dates for response and notifications
    const firstCallDateFormatted = formatUKDate(assignment.firstCallDate);
    const lastCallDate = getLastCallDate(assignment.firstCallDate);
    const lastCallDateFormatted = formatUKDate(lastCallDate);
    const dayTime = `${getDayName(slot.dayOfWeek)} ${formatDisplayTime(slot.time)}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3099";

    // Send confirmation email (don't block on failure)
    try {
      await sendConfirmationEmail({
        student: {
          firstName,
          email,
          joinCode,
        },
        slotInstance: {
          weekNumber: assignment.weekNumber,
          groupCode: assignment.groupCode,
        },
        slot: {
          displayName: slot.displayName,
        },
        settings: {
          showGroupCodes: settings?.showGroupCodes ?? false,
        },
        appUrl,
        firstCallDate: firstCallDateFormatted,
        lastCallDate: lastCallDateFormatted,
      });
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
    }

    // Send Slack notification (don't block on failure)
    try {
      await sendSlackNotification({
        studentName: `${firstName} ${lastName}`,
        email,
        closerName,
        slotDisplayName: slot.displayName,
        weekNumber: assignment.weekNumber,
        groupCode: assignment.groupCode,
        firstCallDate: firstCallDateFormatted,
        lastCallDate: lastCallDateFormatted,
        joinLink: `${appUrl}/join/${joinCode}`,
      });
    } catch (error) {
      console.error("Failed to send Slack notification:", error);
    }

    return NextResponse.json({
      success: true,
      confirmation: {
        firstName,
        dayTime,
        firstCallDate: firstCallDateFormatted,
        lastCallDate: lastCallDateFormatted,
        groupCode: assignment.groupCode,
        joinCode,
        joinLink: `${appUrl}/join/${joinCode}`,
        showGroupCodes: settings?.showGroupCodes ?? false,
        zoomLink: slot.zoomLink,
      },
    });
  } catch (error) {
    console.error("Enrol error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
