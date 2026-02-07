import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, slotInstanceId, phone } = body;

  if (!token || !slotInstanceId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Find the magic link
  const magicLink = await prisma.magicLink.findUnique({
    where: { token },
    include: { student: true },
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

  // Check capacity
  const instance = await prisma.slotInstance.findUnique({
    where: { id: slotInstanceId },
    include: {
      _count: { select: { students: true } },
      slot: true,
    },
  });

  if (!instance) {
    return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  }

  if (instance._count.students >= instance.slot.capacity) {
    return NextResponse.json({ error: "This slot is full" }, { status: 400 });
  }

  // Update student and mark link as used
  const student = await prisma.student.update({
    where: { id: magicLink.studentId },
    data: {
      slotInstanceId,
      phone: phone || undefined,
      status: "SLOT_SELECTED",
    },
    include: {
      slotInstance: {
        include: { slot: true },
      },
    },
  });

  await prisma.magicLink.update({
    where: { id: magicLink.id },
    data: { usedAt: new Date() },
  });

  return NextResponse.json(student);
}
