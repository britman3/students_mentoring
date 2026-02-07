import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { StudentStatus } from "@prisma/client";
import { getDayName, formatDisplayTime } from "@/lib/display";

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    const capacity = settings?.capacity ?? 12;

    const [totalStudents, waitlistCount, slots, recentEnrolments] =
      await Promise.all([
        prisma.student.count({
          where: {
            status: { in: [StudentStatus.SLOT_SELECTED, StudentStatus.ACTIVE] },
          },
        }),
        prisma.waitlistEntry.count({
          where: { status: "WAITING" },
        }),
        prisma.slot.findMany({
          where: { isActive: true },
          include: {
            instances: {
              where: { isActive: true },
            },
          },
        }),
        prisma.student.findMany({
          where: {
            status: { in: [StudentStatus.SLOT_SELECTED, StudentStatus.ACTIVE] },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            slotInstance: {
              include: { slot: true },
            },
          },
        }),
      ]);

    const totalCapacity = slots.reduce(
      (sum, slot) => sum + slot.instances.length * capacity,
      0
    );
    const openSlots = slots.length;

    return NextResponse.json({
      totalStudents,
      totalCapacity,
      openSlots,
      waitlistCount,
      recentEnrolments: recentEnrolments.map((s) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        email: s.email,
        status: s.status,
        slot: s.slotInstance
          ? `${getDayName(s.slotInstance.slot.dayOfWeek)} ${formatDisplayTime(s.slotInstance.slot.time)}`
          : null,
        week: s.slotInstance?.weekNumber ?? null,
        group: s.slotInstance?.groupLabel ?? null,
        enrolledAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
