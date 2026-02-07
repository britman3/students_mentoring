import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-check";
import { stringify } from "csv-stringify/sync";
import { formatDateISO } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const students = await prisma.student.findMany({
    where: {
      status: { in: ["SLOT_SELECTED", "ACTIVE"] },
    },
    include: {
      slotInstance: {
        include: {
          slot: true,
        },
      },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const rows = students.map((s) => ({
    "First Name": s.firstName,
    "Last Name": s.lastName,
    Email: s.email,
    Phone: s.phone ?? "",
    "Chosen Day": s.slotInstance?.slot.day ?? "",
    "Chosen Time": s.slotInstance?.slot.time ?? "",
    "Assigned Week": s.slotInstance?.weekNumber?.toString() ?? "",
    "Group Label": s.slotInstance?.groupLabel ?? "",
    "First Call Date": s.firstCallDate ? formatDateISO(s.firstCallDate) : "",
    "Start Date": s.startDate ? formatDateISO(s.startDate) : "",
    Status: s.status,
    Notes: s.notes ?? "",
  }));

  const csv = stringify(rows, {
    header: true,
    columns: [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Chosen Day",
      "Chosen Time",
      "Assigned Week",
      "Group Label",
      "First Call Date",
      "Start Date",
      "Status",
      "Notes",
    ],
  });

  const today = formatDateISO(new Date());

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=pkh-mentoring-export-${today}.csv`,
    },
  });
}
