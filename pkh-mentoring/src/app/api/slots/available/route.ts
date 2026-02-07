import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { StudentStatus } from "@prisma/client";
import { getDayName, formatDisplayTime } from "@/lib/display";

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) {
      return NextResponse.json(
        { error: "Settings not configured" },
        { status: 500 }
      );
    }

    const capacity = settings.capacity;

    const slots = await prisma.slot.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        instances: {
          where: { isActive: true },
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
        },
      },
    });

    const availableSlots = slots
      .map((slot) => {
        const totalCapacity = slot.instances.length * capacity;
        const totalStudents = slot.instances.reduce(
          (sum, inst) => sum + inst.students.length,
          0
        );
        const availableSpots = totalCapacity - totalStudents;

        return {
          id: slot.id,
          dayOfWeek: slot.dayOfWeek,
          dayName: getDayName(slot.dayOfWeek),
          time: slot.time,
          displayTime: formatDisplayTime(slot.time),
          availableSpots,
        };
      })
      .filter((slot) => slot.availableSpots > 0);

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error("Failed to fetch available slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch available slots" },
      { status: 500 }
    );
  }
}
