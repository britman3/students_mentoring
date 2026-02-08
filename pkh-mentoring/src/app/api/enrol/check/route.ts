import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLastCallDate, formatUKDate } from "@/lib/dates";
import { getDayName, formatDisplayTime } from "@/lib/display";

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "email parameter is required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { email },
      include: {
        slotInstance: {
          include: {
            slot: true,
          },
        },
      },
    });

    if (!student || !student.slotInstance) {
      return NextResponse.json({ exists: false });
    }

    const settings = await prisma.settings.findFirst();
    const slot = student.slotInstance.slot;
    const dayTime = `${getDayName(slot.dayOfWeek)} ${formatDisplayTime(slot.time)}`;

    const firstCallDate = student.firstCallDate
      ? formatUKDate(student.firstCallDate)
      : null;
    const lastCallDate = student.firstCallDate
      ? formatUKDate(getLastCallDate(student.firstCallDate))
      : null;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3099";

    return NextResponse.json({
      exists: true,
      confirmation: {
        firstName: student.firstName,
        dayTime,
        firstCallDate,
        lastCallDate,
        groupCode: student.slotInstance.groupCode,
        joinLink: `${appUrl}/join/${student.joinCode}`,
        showGroupCodes: settings?.showGroupCodes ?? false,
      },
    });
  } catch (error) {
    console.error("Enrol check error:", error);
    return NextResponse.json(
      { error: "Failed to check enrolment status" },
      { status: 500 }
    );
  }
}
