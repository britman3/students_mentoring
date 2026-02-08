import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { ActivityType } from "@prisma/client";

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = await params;

  // Look up student by joinCode
  const student = await prisma.student.findUnique({
    where: { joinCode: code },
    include: {
      slotInstance: {
        include: { slot: true },
      },
    },
  });

  if (!student || !student.slotInstance) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-white px-4">
        <div className="max-w-md text-center">
          <div className="mb-4 text-5xl">{"\u274C"}</div>
          <h1 className="mb-3 text-2xl font-bold text-navy-dark">
            Invalid link
          </h1>
          <p className="text-warm-grey">
            Please check your email for the correct join link, or contact{" "}
            <a
              href="mailto:support@propertyknowhow.com"
              className="font-medium text-navy underline"
            >
              support@propertyknowhow.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  const zoomLink = student.slotInstance.slot.zoomLink;

  if (!zoomLink) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-white px-4">
        <div className="max-w-md text-center">
          <div className="mb-4 text-5xl">{"\u23F3"}</div>
          <h1 className="mb-3 text-2xl font-bold text-navy-dark">
            Link not ready yet
          </h1>
          <p className="text-warm-grey">
            Your mentoring link hasn&rsquo;t been set up yet. Please contact{" "}
            <a
              href="mailto:support@propertyknowhow.com"
              className="font-medium text-navy underline"
            >
              support@propertyknowhow.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Check for recent attendance (30-minute deduplication)
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const recentAttendance = await prisma.attendance.findFirst({
    where: {
      studentId: student.id,
      accessedAt: { gt: thirtyMinutesAgo },
    },
  });

  if (!recentAttendance) {
    // Get request metadata
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      null;
    const userAgent = headersList.get("user-agent") || null;

    // Create attendance record and activity log
    await prisma.attendance.create({
      data: {
        studentId: student.id,
        accessedAt: new Date(),
        ipAddress,
        userAgent,
      },
    });

    await prisma.activityLog.create({
      data: {
        studentId: student.id,
        type: ActivityType.ATTENDANCE_RECORDED,
        title: "Joined mentoring call",
        createdByType: "system",
      },
    });
  }

  // Redirect to Zoom
  redirect(zoomLink);
}
