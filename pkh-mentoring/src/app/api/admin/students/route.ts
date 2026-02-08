import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDayName, formatDisplayTime } from "@/lib/display";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const slotId = searchParams.get("slotId");
    const week = searchParams.get("week");
    const status = searchParams.get("status");

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
