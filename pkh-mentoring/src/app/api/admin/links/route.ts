import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ActivityType } from "@prisma/client";
import { generateToken } from "@/lib/tokens";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) where.status = status;

    const links = await prisma.magicLink.findMany({
      where,
      include: {
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = links.map((link) => ({
      id: link.id,
      token: link.token,
      status: link.status,
      expiresAt: link.expiresAt,
      usedAt: link.usedAt,
      createdAt: link.createdAt,
      student: link.students[0]
        ? {
            id: link.students[0].id,
            name: `${link.students[0].firstName} ${link.students[0].lastName}`,
            email: link.students[0].email,
          }
        : null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Links GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { count, batchNotes } = body;

    const num = parseInt(count, 10);
    if (isNaN(num) || num < 1 || num > 100) {
      return NextResponse.json(
        { error: "Count must be between 1 and 100" },
        { status: 400 }
      );
    }

    const links = [];
    for (let i = 0; i < num; i++) {
      const token = generateToken();
      const link = await prisma.magicLink.create({
        data: { token },
      });
      links.push(link);
    }

    await prisma.activityLog.create({
      data: {
        type: ActivityType.MAGIC_LINK_GENERATED,
        description: `Generated ${num} magic links${batchNotes ? `: ${batchNotes}` : ""}`,
        metadata: {
          count: num,
          batchNotes: batchNotes || null,
          linkIds: links.map((l) => l.id),
        },
      },
    });

    return NextResponse.json(links, { status: 201 });
  } catch (error) {
    console.error("Links POST error:", error);
    return NextResponse.json(
      { error: "Failed to generate links" },
      { status: 500 }
    );
  }
}
