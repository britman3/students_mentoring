import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ActivityType } from "@prisma/client";
import { sendConfirmationEmail } from "@/lib/email";
import { formatUKDate, getLastCallDate } from "@/lib/dates";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        slotInstance: {
          include: { slot: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (!student.slotInstance || !student.joinCode || !student.firstCallDate) {
      return NextResponse.json(
        { error: "Student must have a slot assignment, join code, and first call date" },
        { status: 400 }
      );
    }

    const settings = await prisma.settings.findFirst();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3099";
    const lastCallDate = getLastCallDate(student.firstCallDate);

    await sendConfirmationEmail({
      student: {
        firstName: student.firstName,
        email: student.email,
        joinCode: student.joinCode,
      },
      slotInstance: {
        weekNumber: student.slotInstance.weekNumber,
        groupCode: student.slotInstance.groupCode,
      },
      slot: {
        displayName: student.slotInstance.slot.displayName,
      },
      settings: {
        showGroupCodes: settings?.showGroupCodes ?? false,
      },
      appUrl,
      firstCallDate: formatUKDate(student.firstCallDate),
      lastCallDate: formatUKDate(lastCallDate),
    });

    await prisma.activityLog.create({
      data: {
        studentId: id,
        type: ActivityType.EMAIL_RESENT,
        title: "Confirmation email resent by admin",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend email error:", error);
    return NextResponse.json(
      { error: "Failed to resend email" },
      { status: 500 }
    );
  }
}
