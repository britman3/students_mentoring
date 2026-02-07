import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-check";

export const dynamic = "force-dynamic";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const settings = await prisma.settings.findFirst({ where: { id: "global" } });
  const capacity = settings?.globalCapacity ?? 4;

  // Get all slots with instances and student counts
  const slots = await prisma.slot.findMany({
    include: {
      instances: {
        include: {
          _count: { select: { students: true } },
        },
        orderBy: { weekNumber: "asc" },
      },
      waitlistEntries: {
        where: { status: "WAITING" },
      },
    },
    orderBy: [{ day: "asc" }, { time: "asc" }],
  });

  const totalStudents = await prisma.student.count({
    where: { status: { in: ["SLOT_SELECTED", "ACTIVE"] } },
  });
  const totalCapacity = slots.length * 2 * capacity; // each slot has 2 weeks
  const overallUtilisation =
    totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;

  const perSlot = slots.map((slot) => {
    const week1Instance = slot.instances.find((i) => i.weekNumber === 1);
    const week2Instance = slot.instances.find((i) => i.weekNumber === 2);

    const week1Count = week1Instance?._count.students ?? 0;
    const week2Count = week2Instance?._count.students ?? 0;
    const total = week1Count + week2Count;
    const slotCapacity = capacity * 2;
    const utilisation =
      slotCapacity > 0 ? Math.round((total / slotCapacity) * 100) : 0;

    return {
      slotName: `${slot.day} ${slot.time}`,
      groupLabelWeek1: week1Instance?.groupLabel ?? "—",
      groupLabelWeek2: week2Instance?.groupLabel ?? "—",
      week1Count,
      week2Count,
      total,
      capacity: slotCapacity,
      utilisation,
    };
  });

  const waitlistCounts = slots.map((slot) => ({
    slotName: `${slot.day} ${slot.time}`,
    count: slot.waitlistEntries.length,
  }));

  return NextResponse.json({
    totalStudents,
    totalCapacity,
    overallUtilisation,
    perSlot,
    waitlistCounts,
  });
}
