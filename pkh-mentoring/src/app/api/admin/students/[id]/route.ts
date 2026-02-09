import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ActivityType, StudentStatus } from "@prisma/client";
import { getNextCallDate } from "@/lib/fortnightly";
import { getDayName, formatDisplayTime } from "@/lib/display";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        slotInstance: { include: { slot: true } },
        closer: true,
        attendances: { orderBy: { accessedAt: "desc" } },
        waitlistEntries: { where: { status: "WAITING" } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      status: student.status,
      notes: student.notes,
      joinCode: student.joinCode,
      studentNumber: student.studentNumber,
      firstCallDate: student.firstCallDate,
      createdAt: student.createdAt,
      slot: student.slotInstance
        ? {
            id: student.slotInstance.slot.id,
            displayName: `${getDayName(student.slotInstance.slot.dayOfWeek)} ${formatDisplayTime(student.slotInstance.slot.time)}`,
          }
        : null,
      week: student.slotInstance?.weekNumber ?? null,
      group: student.slotInstance?.groupCode ?? null,
      closerName: student.closer?.firstName ?? null,
      attendances: student.attendances.map((a) => ({
        id: a.id,
        accessedAt: a.accessedAt,
      })),
      hasWaitlistEntry: student.waitlistEntries.length > 0,
    });
  } catch (error) {
    console.error("Student GET error:", error);
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { notes, slotInstanceId, status, promote } = body;

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
          title: "Notes updated",
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

      if (newInstance) {
        const settings = await prisma.settings.findFirst();
        const firstCallDate = getNextCallDate(
          newInstance.slot.dayOfWeek,
          newInstance.slot.time,
          newInstance.weekNumber as 1 | 2,
          new Date(),
          settings?.anchorDate
        );
        updateData.firstCallDate = firstCallDate;
      }

      await prisma.activityLog.create({
        data: {
          studentId: id,
          type: ActivityType.SLOT_REASSIGNED,
          title: "Slot reassigned",
          description: `Reassigned from instance ${oldInstanceId || "none"} to ${newInstance?.slot.displayName || slotInstanceId} Week ${newInstance?.weekNumber}`,
          metadata: {
            oldSlotInstanceId: oldInstanceId,
            newSlotInstanceId: slotInstanceId,
          },
        },
      });
    }

    if (status !== undefined) {
      const oldStatus = student.status;
      updateData.status = status;
      await prisma.activityLog.create({
        data: {
          studentId: id,
          type: ActivityType.STATUS_CHANGED,
          title: `Status changed to ${status}`,
          description: `Status changed from ${oldStatus} to ${status} via admin dashboard`,
          metadata: { oldStatus, newStatus: status },
        },
      });
    }

    if (promote && student.status === StudentStatus.PROSPECT) {
      updateData.status = StudentStatus.SLOT_SELECTED;
      await prisma.activityLog.create({
        data: {
          studentId: id,
          type: ActivityType.STATUS_CHANGED,
          title: "Status changed to SLOT_SELECTED",
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
        closer: true,
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Cascade deletes handle related records (waitlist, attendance, activity logs, payments, arrangements)
    await prisma.student.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Student DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
