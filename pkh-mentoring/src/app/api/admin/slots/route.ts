import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { StudentStatus } from "@prisma/client";
import { getDayName, formatDisplayTime } from "@/lib/display";
import { calculateGridPosition, getGroupCode, generateDisplayName } from "@/lib/grid";

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    const capacity = settings?.capacity ?? 12;

    const slots = await prisma.slot.findMany({
      include: {
        instances: {
          include: {
            students: {
              where: {
                status: {
                  in: [StudentStatus.SLOT_SELECTED, StudentStatus.ACTIVE],
                },
              },
              select: { id: true },
            },
          },
          orderBy: { weekNumber: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const result = slots.map((slot) => ({
      id: slot.id,
      dayOfWeek: slot.dayOfWeek,
      dayName: getDayName(slot.dayOfWeek),
      time: slot.time,
      displayTime: formatDisplayTime(slot.time),
      displayName: slot.displayName,
      zoomLink: slot.zoomLink,
      isOpen: slot.isOpen,
      sortOrder: slot.sortOrder,
      gridPosition: slot.gridPosition,
      instances: slot.instances.map((inst) => ({
        id: inst.id,
        weekNumber: inst.weekNumber,
        groupCode: inst.groupCode,
        capacity,
        studentCount: inst.students.length,
      })),
      totalStudents: slot.instances.reduce(
        (sum, inst) => sum + inst.students.length,
        0
      ),
      totalCapacity: slot.instances.length * capacity,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Slots GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch slots" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dayOfWeek, time, zoomLink } = body;

    if (dayOfWeek === undefined || !time) {
      return NextResponse.json(
        { error: "Day and time are required" },
        { status: 400 }
      );
    }

    const day = parseInt(dayOfWeek, 10);
    if (isNaN(day) || day < 2 || day > 4) {
      return NextResponse.json(
        { error: "Slots can only be created for Tuesday, Wednesday, or Thursday" },
        { status: 400 }
      );
    }

    let gridPosition: number;
    try {
      gridPosition = calculateGridPosition(day, time);
    } catch {
      return NextResponse.json(
        { error: "Slots can only be created at 12pm, 2pm, 4pm, or 6pm" },
        { status: 400 }
      );
    }

    const w1Code = getGroupCode(gridPosition, 1);
    const w2Code = getGroupCode(gridPosition, 2);
    const displayName = generateDisplayName(day, time);

    const slot = await prisma.slot.create({
      data: {
        dayOfWeek: day,
        time,
        displayName,
        zoomLink: zoomLink || null,
        gridPosition,
        sortOrder: gridPosition,
        instances: {
          create: [
            { weekNumber: 1, groupCode: w1Code },
            { weekNumber: 2, groupCode: w2Code },
          ],
        },
      },
      include: {
        instances: true,
      },
    });

    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error("Slots POST error:", error);
    return NextResponse.json(
      { error: "Failed to create slot" },
      { status: 500 }
    );
  }
}
