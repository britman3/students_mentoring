import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: settings.id,
      capacity: settings.capacity,
      anchorDate: settings.anchorDate,
      showGroupCodes: settings.showGroupCodes,
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { capacity, anchorDate, showGroupCodes } = body;

    const settings = await prisma.settings.findFirst();
    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    // Validate capacity
    if (capacity !== undefined) {
      if (typeof capacity !== "number" || capacity < 1) {
        return NextResponse.json({ error: "Capacity must be at least 1" }, { status: 400 });
      }

      // Check max enrolment across all instances
      const instances = await prisma.slotInstance.findMany({
        include: {
          _count: { select: { students: true } },
          slot: true,
        },
      });

      for (const inst of instances) {
        if (inst._count.students > capacity) {
          const weekLabel = inst.weekNumber === 1 ? "1" : "2";
          return NextResponse.json(
            {
              error: `Cannot reduce capacity below ${inst._count.students} — that's the current enrolment in ${inst.slot.displayName} Week ${weekLabel}`,
            },
            { status: 400 }
          );
        }
      }
    }

    const updateData: Record<string, unknown> = {};
    if (capacity !== undefined) updateData.capacity = capacity;
    if (anchorDate !== undefined) updateData.anchorDate = new Date(anchorDate);
    if (showGroupCodes !== undefined) updateData.showGroupCodes = showGroupCodes;

    const updated = await prisma.settings.update({
      where: { id: settings.id },
      data: updateData,
    });

    return NextResponse.json({
      id: updated.id,
      capacity: updated.capacity,
      anchorDate: updated.anchorDate,
      showGroupCodes: updated.showGroupCodes,
    });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
