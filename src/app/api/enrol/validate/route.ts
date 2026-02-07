import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const magicLink = await prisma.magicLink.findUnique({
    where: { token },
    include: {
      student: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!magicLink) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }

  if (magicLink.usedAt) {
    return NextResponse.json({ error: "This link has already been used" }, { status: 400 });
  }

  if (new Date() > magicLink.expiresAt) {
    return NextResponse.json({ error: "This link has expired" }, { status: 400 });
  }

  // Get available slots
  const instances = await prisma.slotInstance.findMany({
    include: {
      slot: true,
      _count: { select: { students: true } },
    },
    orderBy: [{ slot: { day: "asc" } }, { slot: { time: "asc" } }, { weekNumber: "asc" }],
  });

  const slots = instances
    .filter((i) => i.slot.isOpen)
    .map((i) => ({
      id: i.id,
      weekNumber: i.weekNumber,
      groupLabel: i.groupLabel,
      available: i.slot.capacity - i._count.students,
      slot: { day: i.slot.day, time: i.slot.time },
    }));

  return NextResponse.json({
    student: magicLink.student,
    slots,
  });
}
