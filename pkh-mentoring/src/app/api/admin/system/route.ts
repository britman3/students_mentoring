import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentWeek, getNextCallDate } from "@/lib/fortnightly";
import { formatShortDate } from "@/lib/dates";

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    const anchorDate = settings?.anchorDate ?? new Date("2026-01-06T00:00:00.000Z");
    const currentWeek = getCurrentWeek(anchorDate);

    // Calculate next Week 1 and Week 2 dates (using Wednesday 12pm as reference)
    const nextW1Date = getNextCallDate(3, "12:00", 1, new Date(), anchorDate);
    const nextW2Date = getNextCallDate(3, "12:00", 2, new Date(), anchorDate);

    // Environment variable checks
    const envVars = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
      ADMIN_PASSWORD: !!(process.env.ADMIN_PASSWORD || settings?.adminPasswordHash),
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      SLACK_WEBHOOK_URL: !!(process.env.SLACK_WEBHOOK_URL || settings?.slackWebhookUrl),
    };

    // Integration status
    const integrations = {
      slack: !!(process.env.SLACK_WEBHOOK_URL || settings?.slackWebhookUrl),
      resend: !!process.env.RESEND_API_KEY,
      googleSheetSync: false,
    };

    // API endpoints
    const apiEndpoints = [
      { method: "POST", path: "/api/enrol", description: "Student enrolment submission" },
      { method: "GET", path: "/api/enrol/check", description: "Check if email already enrolled" },
      { method: "GET", path: "/api/slots/available", description: "Available slots for enrolment" },
      { method: "POST", path: "/api/admin/auth", description: "Admin login" },
      { method: "DELETE", path: "/api/admin/auth", description: "Admin logout" },
      { method: "GET", path: "/api/admin/settings", description: "Fetch settings" },
      { method: "PUT", path: "/api/admin/settings", description: "Update settings" },
      { method: "PUT", path: "/api/admin/settings/password", description: "Change admin password" },
      { method: "GET", path: "/api/admin/slots", description: "List all slots" },
      { method: "POST", path: "/api/admin/slots", description: "Create new slot" },
      { method: "PUT", path: "/api/admin/slots/[id]", description: "Update slot (Zoom link, status)" },
      { method: "GET", path: "/api/admin/students", description: "List students (search/filters)" },
      { method: "POST", path: "/api/admin/students", description: "Add student manually" },
      { method: "GET", path: "/api/admin/students/[id]", description: "Student details" },
      { method: "PUT", path: "/api/admin/students/[id]", description: "Update student" },
      { method: "POST", path: "/api/admin/students/[id]/resend-email", description: "Resend confirmation email" },
      { method: "PUT", path: "/api/admin/students/bulk-status", description: "Bulk status change" },
      { method: "GET", path: "/api/admin/stats/summary", description: "Dashboard stats" },
      { method: "GET", path: "/api/admin/stats", description: "Full analytics" },
      { method: "GET", path: "/api/admin/csv", description: "CSV export" },
      { method: "GET", path: "/api/admin/system", description: "System information" },
      { method: "POST", path: "/api/sync/student", description: "Google Sheet sync (external)" },
    ];

    // Slot grid reference
    const slotGrid = [
      { position: 1, day: "Tuesday", time: "12pm", w1Code: "W1A", w2Code: "W2M" },
      { position: 2, day: "Tuesday", time: "2pm", w1Code: "W1B", w2Code: "W2N" },
      { position: 3, day: "Tuesday", time: "4pm", w1Code: "W1C", w2Code: "W2O" },
      { position: 4, day: "Tuesday", time: "6pm", w1Code: "W1D", w2Code: "W2P" },
      { position: 5, day: "Wednesday", time: "12pm", w1Code: "W1E", w2Code: "W2Q" },
      { position: 6, day: "Wednesday", time: "2pm", w1Code: "W1F", w2Code: "W2R" },
      { position: 7, day: "Wednesday", time: "4pm", w1Code: "W1G", w2Code: "W2S" },
      { position: 8, day: "Wednesday", time: "6pm", w1Code: "W1H", w2Code: "W2T" },
      { position: 9, day: "Thursday", time: "12pm", w1Code: "W1I", w2Code: "W2U" },
      { position: 10, day: "Thursday", time: "2pm", w1Code: "W1J", w2Code: "W2V" },
      { position: 11, day: "Thursday", time: "4pm", w1Code: "W1K", w2Code: "W2W" },
      { position: 12, day: "Thursday", time: "6pm", w1Code: "W1L", w2Code: "W2X" },
    ];

    return NextResponse.json({
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3099",
      database: {
        name: "mentoring_db",
        port: 5433,
        user: "pkh_user",
        containerName: "mentoring-db",
      },
      application: {
        port: 3099,
        pm2Process: "pkh-mentoring",
        domain: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3099",
      },
      fortnightly: {
        anchorDate: formatShortDate(anchorDate),
        currentWeek,
        nextWeek1: formatShortDate(nextW1Date),
        nextWeek2: formatShortDate(nextW2Date),
      },
      envVars,
      integrations,
      apiEndpoints,
      slotGrid,
    });
  } catch (error) {
    console.error("System info error:", error);
    return NextResponse.json(
      { error: "Failed to fetch system info" },
      { status: 500 }
    );
  }
}
