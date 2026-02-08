import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
