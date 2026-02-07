import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-check";

export const dynamic = "force-dynamic";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const students = await prisma.student.findMany({
    include: {
      slotInstance: {
        include: {
          slot: true,
        },
      },
      magicLink: {
        select: { token: true, usedAt: true, expiresAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(students);
}
