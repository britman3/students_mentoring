import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MagicLinkStatus } from "@prisma/client";
import { getDayName, formatDisplayTime } from "@/lib/display";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
    });

    if (!magicLink) {
      return NextResponse.json(
        { status: "invalid", message: "This link is not valid." },
        { status: 404 }
      );
    }

    if (magicLink.expiresAt && magicLink.expiresAt < new Date()) {
      return NextResponse.json(
        { status: "expired", message: "This link has expired." },
        { status: 410 }
      );
    }

    if (
      magicLink.status === MagicLinkStatus.EXPIRED ||
      magicLink.status === MagicLinkStatus.REVOKED
    ) {
      return NextResponse.json(
        {
          status: magicLink.status.toLowerCase(),
          message:
            magicLink.status === MagicLinkStatus.EXPIRED
              ? "This link has expired."
              : "This link has been revoked.",
        },
        { status: 410 }
      );
    }

    if (
      magicLink.status === MagicLinkStatus.COMPLETED ||
      magicLink.status === MagicLinkStatus.USED
    ) {
      const student = await prisma.student.findFirst({
        where: { magicLinkId: magicLink.id },
        include: {
          slotInstance: {
            include: { slot: true },
          },
        },
      });

      const settings = await prisma.settings.findFirst();

      if (!student || !student.slotInstance) {
        return NextResponse.json(
          { status: "completed", message: "This link has already been used." },
          { status: 200 }
        );
      }

      const slot = student.slotInstance.slot;
      const dayName = getDayName(slot.dayOfWeek);
      const displayTime = formatDisplayTime(slot.time);

      let formattedFirstCallDate = "";
      if (student.firstCallDate) {
        const londonDate = toZonedTime(student.firstCallDate, "Europe/London");
        formattedFirstCallDate = format(
          londonDate,
          "EEEE do MMMM yyyy 'at' h:mm a"
        );
      }

      return NextResponse.json({
        status: "completed",
        student: {
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
        },
        slot: {
          dayName,
          displayTime,
          zoomLink: slot.zoomLink,
        },
        firstCallDate: formattedFirstCallDate,
        groupLabel: student.slotInstance.groupLabel,
        showGroupLabels: settings?.showGroupLabels ?? false,
      });
    }

    // Valid token (UNUSED or OPENED) — update to OPENED on first visit
    if (magicLink.status === MagicLinkStatus.UNUSED) {
      await prisma.magicLink.update({
        where: { id: magicLink.id },
        data: { status: MagicLinkStatus.OPENED },
      });
    }

    return NextResponse.json({ status: "valid", token });
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate token" },
      { status: 500 }
    );
  }
}
