import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ActivityType } from "@prisma/client";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentIds, status } = body;

    if (!Array.isArray(studentIds) || studentIds.length === 0 || !status) {
      return NextResponse.json(
        { error: "studentIds (array) and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const students = await prisma.student.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, status: true },
    });

    await prisma.student.updateMany({
      where: { id: { in: studentIds } },
      data: { status },
    });

    // Create activity logs for each student
    await prisma.activityLog.createMany({
      data: students.map((s) => ({
        studentId: s.id,
        type: ActivityType.STATUS_CHANGED,
        title: `Status changed to ${status} (bulk)`,
        description: `Status changed from ${s.status} to ${status} via bulk action`,
        metadata: { oldStatus: s.status, newStatus: status },
      })),
    });

    return NextResponse.json({ success: true, count: students.length });
  } catch (error) {
    console.error("Bulk status error:", error);
    return NextResponse.json(
      { error: "Failed to update statuses" },
      { status: 500 }
    );
  }
}
