import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-check";

export const dynamic = "force-dynamic";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  let settings = await prisma.settings.findFirst({ where: { id: "global" } });
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        id: "global",
        globalCapacity: 4,
        week1AnchorDate: new Date("2026-01-19T00:00:00.000Z"),
        showGroupLabels: true,
      },
    });
  }

  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { globalCapacity, week1AnchorDate, showGroupLabels } = body;

  // Validate capacity: cannot reduce below current max enrolment in any instance
  if (globalCapacity !== undefined) {
    const maxEnrolment = await prisma.slotInstance.findFirst({
      select: {
        _count: { select: { students: true } },
      },
      orderBy: {
        students: { _count: "desc" },
      },
    });

    const currentMax = maxEnrolment?._count.students ?? 0;
    if (globalCapacity < currentMax) {
      return NextResponse.json(
        {
          error: `Cannot reduce capacity below ${currentMax} (current max enrolment in a single instance)`,
        },
        { status: 400 }
      );
    }

    if (globalCapacity < 1) {
      return NextResponse.json(
        { error: "Capacity must be at least 1" },
        { status: 400 }
      );
    }
  }

  const updateData: Record<string, unknown> = {};
  if (globalCapacity !== undefined) updateData.globalCapacity = globalCapacity;
  if (week1AnchorDate !== undefined)
    updateData.week1AnchorDate = new Date(week1AnchorDate);
  if (showGroupLabels !== undefined) updateData.showGroupLabels = showGroupLabels;

  const settings = await prisma.settings.update({
    where: { id: "global" },
    data: updateData,
  });

  // If capacity changed, update all slots
  if (globalCapacity !== undefined) {
    await prisma.slot.updateMany({
      data: { capacity: globalCapacity },
    });
  }

  return NextResponse.json(settings);
}
