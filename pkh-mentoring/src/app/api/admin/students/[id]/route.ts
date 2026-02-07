import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ActivityType, StudentStatus } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { notes, slotInstanceId, promote } = body;

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (notes !== undefined) {
      updateData.notes = notes;
      await prisma.activityLog.create({
        data: {
          studentId: id,
          type: ActivityType.NOTE_ADDED,
          description: "Notes updated via admin dashboard",
        },
      });
    }

    if (slotInstanceId !== undefined) {
      const oldInstanceId = student.slotInstanceId;
      updateData.slotInstanceId = slotInstanceId;

      const newInstance = await prisma.slotInstance.findUnique({
        where: { id: slotInstanceId },
        include: { slot: true },
      });

      await prisma.activityLog.create({
        data: {
          studentId: id,
          type: ActivityType.SLOT_ASSIGNED,
          description: `Reassigned from instance ${oldInstanceId || "none"} to ${newInstance?.slot.id || slotInstanceId} Week ${newInstance?.weekNumber}`,
          metadata: {
            oldSlotInstanceId: oldInstanceId,
            newSlotInstanceId: slotInstanceId,
          },
        },
      });
    }

    if (promote && student.status === StudentStatus.PROSPECT) {
      updateData.status = StudentStatus.SLOT_SELECTED;
      await prisma.activityLog.create({
        data: {
          studentId: id,
          type: ActivityType.STATUS_CHANGED,
          description: "Promoted from waitlist via admin dashboard",
          metadata: {
            oldStatus: student.status,
            newStatus: StudentStatus.SLOT_SELECTED,
          },
        },
      });
    }

    const updated = await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        slotInstance: {
          include: { slot: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Student PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}
