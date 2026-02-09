import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ActivityType, StudentStatus } from "@prisma/client";
import { getDayName, formatDisplayTime } from "@/lib/display";
import { assignStudentToSlot } from "@/lib/assignment";
import { sendConfirmationEmail } from "@/lib/email";
import { formatUKDate, getLastCallDate } from "@/lib/dates";
import { customAlphabet } from "nanoid";

const generateJoinCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const slotId = searchParams.get("slotId");
    const week = searchParams.get("week");
    const status = searchParams.get("status");
    const closerId = searchParams.get("closerId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (closerId) {
      where.closerId = closerId;
    }

    if (slotId || week) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const instanceWhere: any = {};
      if (slotId) instanceWhere.slotId = slotId;
      if (week) instanceWhere.weekNumber = parseInt(week, 10);
      where.slotInstance = instanceWhere;
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        slotInstance: {
          include: { slot: true },
        },
        closer: true,
        _count: {
          select: { attendances: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = students.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      name: `${s.firstName} ${s.lastName}`,
      email: s.email,
      phone: s.phone,
      status: s.status,
      notes: s.notes,
      joinCode: s.joinCode,
      studentNumber: s.studentNumber,
      firstCallDate: s.firstCallDate,
      createdAt: s.createdAt,
      slot: s.slotInstance
        ? {
            id: s.slotInstance.slot.id,
            displayName: `${getDayName(s.slotInstance.slot.dayOfWeek)} ${formatDisplayTime(s.slotInstance.slot.time)}`,
            dayName: getDayName(s.slotInstance.slot.dayOfWeek),
            time: formatDisplayTime(s.slotInstance.slot.time),
          }
        : null,
      week: s.slotInstance?.weekNumber ?? null,
      group: s.slotInstance?.groupCode ?? null,
      slotInstanceId: s.slotInstanceId,
      attendedCount: s._count.attendances,
      closerName: s.closer?.firstName ?? null,
      closerId: s.closerId,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Students GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, slotId, closerId } = body;

    if (!firstName || !lastName || !email || !phone || !slotId) {
      return NextResponse.json(
        { error: "firstName, lastName, email, phone, and slotId are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.student.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A student with this email already exists" },
        { status: 409 }
      );
    }

    const assignment = await assignStudentToSlot(slotId);

    let joinCode = generateJoinCode();
    while (await prisma.student.findUnique({ where: { joinCode } })) {
      joinCode = generateJoinCode();
    }

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        slotInstanceId: assignment.slotInstanceId,
        firstCallDate: assignment.firstCallDate,
        joinCode,
        status: StudentStatus.SLOT_SELECTED,
        closerId: closerId || null,
      },
      include: {
        slotInstance: {
          include: { slot: true },
        },
        closer: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        studentId: student.id,
        type: ActivityType.SLOT_ASSIGNED,
        title: "Student added manually by admin",
        createdByType: "admin",
        metadata: {
          slotInstanceId: assignment.slotInstanceId,
          weekNumber: assignment.weekNumber,
          groupCode: assignment.groupCode,
        },
      },
    });

    // Send confirmation email
    try {
      const settings = await prisma.settings.findFirst();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3099";
      const lastCallDate = getLastCallDate(assignment.firstCallDate);

      await sendConfirmationEmail({
        student: {
          firstName: student.firstName,
          email: student.email,
          joinCode: student.joinCode!,
        },
        slotInstance: {
          weekNumber: assignment.weekNumber,
          groupCode: assignment.groupCode,
        },
        slot: {
          displayName: student.slotInstance!.slot.displayName,
        },
        settings: {
          showGroupCodes: settings?.showGroupCodes ?? false,
        },
        appUrl,
        firstCallDate: formatUKDate(assignment.firstCallDate),
        lastCallDate: formatUKDate(lastCallDate),
      });
    } catch (emailErr) {
      console.error("Failed to send confirmation email:", emailErr);
    }

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Students POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to create student";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids array is required" },
        { status: 400 }
      );
    }

    // Cascade deletes handle related records
    await prisma.student.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true, deletedCount: ids.length });
  } catch (error) {
    console.error("Students DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete students" },
      { status: 500 }
    );
  }
}
