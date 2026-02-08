import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { StudentStatus } from "@prisma/client";
import { getDayName, formatDisplayTime } from "@/lib/display";

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    const capacity = settings?.capacity ?? 12;

    const [students, slots, waitlistEntries, closers] = await Promise.all([
      prisma.student.findMany({
        where: {
          status: { in: [StudentStatus.SLOT_SELECTED, StudentStatus.ACTIVE] },
        },
        select: { slotInstanceId: true },
      }),
      prisma.slot.findMany({
        where: { isOpen: true },
        include: {
          instances: {
            include: {
              _count: { select: { students: true } },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.waitlistEntry.findMany({
        where: { status: "WAITING" },
        include: {
          slotInstance: {
            include: { slot: true },
          },
        },
      }),
      prisma.closer.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              students: {
                where: {
                  status: {
                    in: [StudentStatus.SLOT_SELECTED, StudentStatus.ACTIVE],
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    // Auto-expire waitlist entries
    const now = new Date();
    const expiredIds = waitlistEntries
      .filter((w) => w.expiresAt < now && w.status === "WAITING")
      .map((w) => w.id);

    if (expiredIds.length > 0) {
      await prisma.waitlistEntry.updateMany({
        where: { id: { in: expiredIds } },
        data: { status: "EXPIRED" },
      });
    }

    const activeWaitlist = waitlistEntries.filter(
      (w) => w.expiresAt >= now && w.status === "WAITING"
    );

    const totalStudents = students.length;
    const totalCapacity = slots.reduce(
      (sum, slot) => sum + slot.instances.length * capacity,
      0
    );
    const overallUtilisation =
      totalCapacity > 0
        ? Math.round((totalStudents / totalCapacity) * 100)
        : 0;

    // Per-slot stats
    const perSlot = slots.map((slot) => {
      const w1 = slot.instances.find((i) => i.weekNumber === 1);
      const w2 = slot.instances.find((i) => i.weekNumber === 2);
      const week1Count = w1?._count.students ?? 0;
      const week2Count = w2?._count.students ?? 0;
      const total = week1Count + week2Count;
      const slotCapacity = slot.instances.length * capacity;
      const utilisation =
        slotCapacity > 0 ? Math.round((total / slotCapacity) * 100) : 0;

      return {
        displayName: `${getDayName(slot.dayOfWeek)} ${formatDisplayTime(slot.time)}`,
        groupCodeWeek1: w1?.groupCode ?? null,
        groupCodeWeek2: w2?.groupCode ?? null,
        week1Count,
        week2Count,
        total,
        capacity,
        utilisation,
      };
    });

    // Waitlist counts per slot
    const waitlistMap = new Map<string, number>();
    for (const entry of activeWaitlist) {
      const name = `${getDayName(entry.slotInstance.slot.dayOfWeek)} ${formatDisplayTime(entry.slotInstance.slot.time)}`;
      waitlistMap.set(name, (waitlistMap.get(name) ?? 0) + 1);
    }
    const waitlistCounts = Array.from(waitlistMap.entries()).map(
      ([displayName, count]) => ({ displayName, count })
    );

    // Closer stats
    const closerStats = closers
      .filter((c) => c._count.students > 0)
      .map((c) => ({
        closerName: [c.firstName, c.lastName].filter(Boolean).join(" "),
        studentCount: c._count.students,
      }))
      .sort((a, b) => b.studentCount - a.studentCount);

    return NextResponse.json({
      totalStudents,
      totalCapacity,
      overallUtilisation,
      perSlot,
      waitlistCounts,
      closerStats,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
