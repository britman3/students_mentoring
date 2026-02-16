import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if any students are assigned to this slot's instances
    const studentCount = await prisma.student.count({
      where: {
        slotInstance: {
          slotId: id,
        },
      },
    });

    if (studentCount > 0) {
      return NextResponse.json(
        {
          error: `This slot has ${studentCount} student${studentCount !== 1 ? "s" : ""} assigned. Reassign or delete them before removing this slot.`,
        },
        { status: 400 }
      );
    }

    // Delete the slot (SlotInstances cascade-delete via Prisma schema)
    await prisma.slot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Slot DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete slot" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { zoomLink, isOpen, isActive } = body;

    const updateData: Record<string, unknown> = {};
    if (zoomLink !== undefined) updateData.zoomLink = zoomLink || null;
    if (isOpen !== undefined) updateData.isOpen = isOpen;
    else if (isActive !== undefined) updateData.isOpen = isActive;

    const slot = await prisma.slot.update({
      where: { id },
      data: updateData,
      include: {
        instances: true,
      },
    });

    return NextResponse.json(slot);
  } catch (error) {
    console.error("Slot PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update slot" },
      { status: 500 }
    );
  }
}
