import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MagicLinkStatus } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { revoke } = body;

    if (revoke) {
      const link = await prisma.magicLink.findUnique({ where: { id } });
      if (!link) {
        return NextResponse.json(
          { error: "Link not found" },
          { status: 404 }
        );
      }
      if (link.status !== MagicLinkStatus.UNUSED) {
        return NextResponse.json(
          { error: "Can only revoke unused links" },
          { status: 400 }
        );
      }

      const updated = await prisma.magicLink.update({
        where: { id },
        data: { status: MagicLinkStatus.REVOKED },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "No action specified" }, { status: 400 });
  } catch (error) {
    console.error("Link PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update link" },
      { status: 500 }
    );
  }
}
