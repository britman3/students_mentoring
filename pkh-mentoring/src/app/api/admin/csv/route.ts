import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { StudentStatus } from "@prisma/client";
import { getDayName, formatDisplayTime } from "@/lib/display";
import { getLastCallDate } from "@/lib/dates";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TIMEZONE = "Europe/London";

function formatDateUK(date: Date | null): string {
  if (!date) return "";
  const zoned = toZonedTime(date, TIMEZONE);
  return format(zoned, "dd/MM/yyyy");
}

function escapeCSV(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      where: {
        status: {
          in: [
            StudentStatus.SLOT_SELECTED,
            StudentStatus.ACTIVE,
            StudentStatus.PAUSED,
            StudentStatus.COMPLETED,
            StudentStatus.CANCELLED,
          ],
        },
      },
      include: {
        slotInstance: {
          include: { slot: true },
        },
        closer: true,
        _count: {
          select: { attendances: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Closer Name",
      "Student Number",
      "Chosen Day",
      "Chosen Time",
      "Assigned Week (1/2)",
      "Group Code",
      "First Call Date",
      "Last Call Date",
      "Attended Count",
      "Start Date",
      "Status",
      "Notes",
    ];

    const rows = students.map((s) => {
      const lastCallDate = s.firstCallDate
        ? getLastCallDate(s.firstCallDate)
        : null;

      return [
        escapeCSV(s.firstName),
        escapeCSV(s.lastName),
        escapeCSV(s.email),
        escapeCSV(s.phone),
        escapeCSV(s.closer?.firstName),
        escapeCSV(s.studentNumber),
        escapeCSV(
          s.slotInstance
            ? getDayName(s.slotInstance.slot.dayOfWeek)
            : ""
        ),
        escapeCSV(
          s.slotInstance
            ? formatDisplayTime(s.slotInstance.slot.time)
            : ""
        ),
        escapeCSV(s.slotInstance?.weekNumber?.toString()),
        escapeCSV(s.slotInstance?.groupCode),
        escapeCSV(formatDateUK(s.firstCallDate)),
        escapeCSV(lastCallDate ? formatDateUK(lastCallDate) : ""),
        String(s._count.attendances),
        escapeCSV(formatDateUK(s.startDate)),
        escapeCSV(s.status),
        escapeCSV(s.notes),
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const today = format(new Date(), "yyyy-MM-dd");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=pkh-mentoring-export-${today}.csv`,
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json(
      { error: "Failed to export CSV" },
      { status: 500 }
    );
  }
}
