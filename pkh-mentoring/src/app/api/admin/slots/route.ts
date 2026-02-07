import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { StudentStatus } from "@prisma/client";
import { getDayName, formatDisplayTime } from "@/lib/display";

const GROUP_LABELS_WEEK1 = ["A", "B", "C", "D", "E", "F", "G", "H"];
const GROUP_LABELS_WEEK2 = ["M", "N", "O", "P", "Q", "R", "S", "T"];

async function getNextGroupLabels(): Promise<[string, string]> {
  const instances = await prisma.slotInstance.findMany({
    select: { groupLabel: true },
  });
  const existing = new Set(instances.map((i) => i.groupLabel));

  const label1 = GROUP_LABELS_WEEK1.find((l) => !existing.has(l)) || "X";
  const label2 = GROUP_LABELS_WEEK2.find((l) => !existing.has(l)) || "Y";
  return [label1, label2];
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

    // Get next sort order
    const maxSort = await prisma.slot.aggregate({ _max: { sortOrder: true } });
    const nextSort = (maxSort._max.sortOrder ?? 0) + 1;

    const [group1, group2] = await getNextGroupLabels();

    const slot = await prisma.slot.create({
      data: {
        dayOfWeek: day,
        time,
        zoomLink: zoomLink || null,
        sortOrder: nextSort,
        instances: {
          create: [
            { weekNumber: 1, groupLabel: group1 },
            { weekNumber: 2, groupLabel: group2 },
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
