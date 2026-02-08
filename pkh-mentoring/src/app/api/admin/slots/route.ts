import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { StudentStatus } from "@prisma/client";
import { getDayName, formatDisplayTime } from "@/lib/display";

// Fixed group labels: day+time → { week1 label, week2 label, sortOrder }
// Tuesday 12/2/4/6 → A-D, Wednesday 12/2/4/6 → E-H, Thursday 12/2/4/6 → I-L
const FIXED_SLOT_CONFIG: Record<
  string,
  { week1: string; week2: string; sortOrder: number }
> = {
  "2-12:00": { week1: "A", week2: "M", sortOrder: 0 },
  "2-14:00": { week1: "B", week2: "N", sortOrder: 1 },
  "2-16:00": { week1: "C", week2: "O", sortOrder: 2 },
  "2-18:00": { week1: "D", week2: "P", sortOrder: 3 },
  "3-12:00": { week1: "E", week2: "Q", sortOrder: 4 },
  "3-14:00": { week1: "F", week2: "R", sortOrder: 5 },
  "3-16:00": { week1: "G", week2: "S", sortOrder: 6 },
  "3-18:00": { week1: "H", week2: "T", sortOrder: 7 },
  "4-12:00": { week1: "I", week2: "U", sortOrder: 8 },
  "4-14:00": { week1: "J", week2: "V", sortOrder: 9 },
  "4-16:00": { week1: "K", week2: "W", sortOrder: 10 },
  "4-18:00": { week1: "L", week2: "X", sortOrder: 11 },
};

function getFixedConfig(dayOfWeek: number, time: string) {
  const key = `${dayOfWeek}-${time}`;
  return FIXED_SLOT_CONFIG[key] || null;
}

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
      displayName: `${getDayName(slot.dayOfWeek)} ${formatDisplayTime(slot.time)}`,
      zoomLink: slot.zoomLink,
      isActive: slot.isActive,
      sortOrder: slot.sortOrder,
      instances: slot.instances.map((inst) => ({
        id: inst.id,
        weekNumber: inst.weekNumber,
        groupLabel: inst.groupLabel,
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
    if (isNaN(day) || day < 0 || day > 6) {
      return NextResponse.json({ error: "Invalid day" }, { status: 400 });
    }

    const config = getFixedConfig(day, time);
    if (!config) {
      return NextResponse.json(
        { error: "Slots can only be created for Tuesday, Wednesday, or Thursday at 12pm, 2pm, 4pm, or 6pm" },
        { status: 400 }
      );
    }

    const slot = await prisma.slot.create({
      data: {
        dayOfWeek: day,
        time,
        zoomLink: zoomLink || null,
        sortOrder: config.sortOrder,
        instances: {
          create: [
            { weekNumber: 1, groupLabel: config.week1 },
            { weekNumber: 2, groupLabel: config.week2 },
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
