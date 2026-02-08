import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  MagicLinkStatus,
  StudentStatus,
  ActivityType,
  WaitlistStatus,
} from "@prisma/client";
import { assignStudentToSlot } from "@/lib/assignment";
import { getDayName, formatDisplayTime } from "@/lib/display";
import { sendConfirmationEmail } from "@/lib/email";
import { sendSlackNotification } from "@/lib/slack";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { addMonths } from "date-fns";

interface EnrolRequestBody {
  token: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  slotId: string;
  waitlistSlotId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EnrolRequestBody = await request.json();
    const { token, firstName, lastName, email, phone, slotId, waitlistSlotId } =
      body;

    // Validate required fields
    if (!token || !firstName || !lastName || !email || !phone || !slotId) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // Validate token
    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
    });

    if (!magicLink) {
      return NextResponse.json(
        { error: "Invalid enrolment link." },
        { status: 404 }
      );
    }

    if (
      magicLink.status === MagicLinkStatus.COMPLETED ||
      magicLink.status === MagicLinkStatus.USED
    ) {
      return NextResponse.json(
        { error: "This enrolment link has already been used." },
        { status: 409 }
      );
    }

    if (
      magicLink.status === MagicLinkStatus.EXPIRED ||
      magicLink.status === MagicLinkStatus.REVOKED
    ) {
      return NextResponse.json(
        { error: "This enrolment link is no longer valid." },
        { status: 410 }
      );
    }

    if (magicLink.expiresAt && magicLink.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This enrolment link has expired." },
        { status: 410 }
      );
    }

    // Check if student already exists
    const existingStudent = await prisma.student.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingStudent && existingStudent.status !== StudentStatus.PROSPECT) {
      return NextResponse.json(
        { error: "A student with this email address is already registered." },
        { status: 409 }
      );
    }

    // Run auto-assignment logic
    const assignment = await assignStudentToSlot(slotId);

    let student;

    if (existingStudent && existingStudent.status === StudentStatus.PROSPECT) {
      // PROSPECT exists from sheet sync — upgrade to SLOT_SELECTED
      student = await prisma.student.update({
        where: { id: existingStudent.id },
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          status: StudentStatus.SLOT_SELECTED,
          slotInstanceId: assignment.slotInstanceId,
          firstCallDate: assignment.firstCallDate,
          magicLinkId: magicLink.id,
        },
      });
    } else {
      // No existing student — create new
      student = await prisma.student.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          status: StudentStatus.SLOT_SELECTED,
          slotInstanceId: assignment.slotInstanceId,
          firstCallDate: assignment.firstCallDate,
          magicLinkId: magicLink.id,
        },
      });
    }

    // Update magic link to COMPLETED
    await prisma.magicLink.update({
      where: { id: magicLink.id },
      data: {
        status: MagicLinkStatus.COMPLETED,
        usedAt: new Date(),
      },
    });

    // Create activity log entry
    await prisma.activityLog.create({
      data: {
        studentId: student.id,
        type: ActivityType.SLOT_ASSIGNED,
        description: "Slot assigned automatically",
        metadata: {
          createdByType: "system",
          slotId,
          slotInstanceId: assignment.slotInstanceId,
          weekNumber: assignment.weekNumber,
          groupLabel: assignment.groupLabel,
        },
      },
    });

    // Create waitlist entry if requested
    if (waitlistSlotId && waitlistSlotId !== slotId) {
      await prisma.waitlistEntry.create({
        data: {
          studentId: student.id,
          slotId: waitlistSlotId,
          status: WaitlistStatus.WAITING,
          expiresAt: addMonths(new Date(), 2),
        },
      });
    }

    // Fetch slot details for response
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
    });

    const settings = await prisma.settings.findFirst();

    const dayName = slot ? getDayName(slot.dayOfWeek) : "";
    const displayTime = slot ? formatDisplayTime(slot.time) : "";

    const londonDate = toZonedTime(assignment.firstCallDate, "Europe/London");
    const formattedFirstCallDate = format(
      londonDate,
      "EEEE do MMMM yyyy 'at' h:mm a"
    );

    // Send confirmation email (best effort)
    sendConfirmationEmail({
      to: student.email,
      firstName: student.firstName,
      dayAndTime: `${dayName} ${displayTime}`,
      firstCallDate: formattedFirstCallDate,
      zoomLink: slot?.zoomLink,
    }).catch((err) => {
      console.error("Failed to send confirmation email:", err);
    });

    // Send Slack notification (best effort)
    sendSlackNotification({
      studentName: `${student.firstName} ${student.lastName}`,
      email: student.email,
      dayName,
      time: displayTime,
      weekNumber: assignment.weekNumber,
      groupLabel: assignment.groupLabel,
      firstCallDate: formattedFirstCallDate,
    }).catch((err) => {
      console.error("Failed to send Slack notification:", err);
    });

    return NextResponse.json({
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
      },
      slot: {
        dayName,
        displayTime,
        zoomLink: slot?.zoomLink ?? null,
      },
      firstCallDate: formattedFirstCallDate,
      groupLabel: assignment.groupLabel,
      showGroupLabels: settings?.showGroupLabels ?? false,
    });
  } catch (error) {
    console.error("Enrolment error:", error);

    if (error instanceof Error) {
      if (error.message.includes("fully booked")) {
        return NextResponse.json(
          {
            error:
              "This slot is now fully booked. Please go back and select another slot.",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
