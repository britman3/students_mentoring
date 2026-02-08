import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { StudentStatus } from "@prisma/client";
import { getDayName, formatDisplayTime } from "@/lib/display";

const GROUP_LABELS_WEEK1 = ["A", "B", "C", "D", "E", "F", "G", "H"];
const GROUP_LABELS_WEEK2 = ["M", "N", "O", "P", "Q", "R", "S", "T"];

async function recalculateSortOrderAndGroups(): Promise<void> {
  const slots = await prisma.slot.findMany({
    include: { instances: { orderBy: { weekNumber: "asc" } } },
    orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
  });

  const updates = [];

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];

    updates.push(
      prisma.slot.update({
        where: { id: slot.id },
        data: { sortOrder: i },
      })
    );

    for (const instance of slot.instances) {
      const label =
        instance.weekNumber === 1
          ? GROUP_LABELS_WEEK1[i] || "X"
          : GROUP_LABELS_WEEK2[i] || "Y";

      updates.push(
        prisma.slotInstance.update({
          where: { id: instance.id },
          data: { groupLabel: label },
        })
      );
    }
  }

  await prisma.$transaction(updates);
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

    // Create with temporary sortOrder; will be recalculated below
    const slot = await prisma.slot.create({
      data: {
        dayOfWeek: day,
        time,
        zoomLink: zoomLink || null,
        sortOrder: 0,
        instances: {
          create: [
            { weekNumber: 1, groupLabel: "X" },
            { weekNumber: 2, groupLabel: "Y" },
          ],
        },
      },
      include: {
        instances: true,
      },
    });

    // Recalculate sortOrder and group labels for all slots
    await recalculateSortOrderAndGroups();

    // Re-fetch to return updated data
    const updated = await prisma.slot.findUnique({
      where: { id: slot.id },
      include: { instances: true },
    });

    return NextResponse.json(updated, { status: 201 });
  } catch (error) {
    console.error("Slots POST error:", error);
    return NextResponse.json(
      { error: "Failed to create slot" },
      { status: 500 }
    );
  }
}
