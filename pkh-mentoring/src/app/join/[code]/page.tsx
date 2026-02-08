import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { ActivityType } from "@prisma/client";
import { getLastCallDate } from "@/lib/dates";

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

  // No match → Invalid link
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

  // Check if mentoring period has expired
  if (student.firstCallDate) {
    const lastCallDate = getLastCallDate(student.firstCallDate);
    const now = new Date();
    if (now > lastCallDate) {
      const formattedDate = lastCallDate.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return (
        <div className="flex min-h-screen items-center justify-center bg-warm-white px-4">
          <div className="max-w-lg text-center">
            <div className="mb-6">
              <img
                src="/pkh_logo.svg"
                alt="Property Know How"
                className="mx-auto h-16 w-auto"
              />
            </div>
            <h1 className="mb-4 text-2xl font-bold text-navy-dark">
              Your Mentoring Support Has Ended
            </h1>
            <p className="mb-4 text-warm-grey leading-relaxed">
              Your 6-month mentoring period ended on{" "}
              <span className="font-medium text-charcoal">{formattedDate}</span>.
              Thank you for being part of the Property Know How mentoring programme.
            </p>
            <p className="mb-6 text-warm-grey leading-relaxed">
              If you believe this is an error or would like to discuss extending
              your support, please get in touch.
            </p>
            <a
              href="mailto:support@propertyknowhow.com"
              className="inline-block rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
            >
              Contact Support
            </a>
          </div>
        </div>
      );
    }
  }

  const zoomLink = student.slotInstance.slot.zoomLink;

  // Match but no Zoom link
  if (!zoomLink) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-white px-4">
        <div className="max-w-md text-center">
          <div className="mb-4 text-5xl">{"\u23F3"}</div>
          <h1 className="mb-3 text-2xl font-bold text-navy-dark">
            Link not ready yet
          </h1>
          <p className="text-warm-grey">
            Your link is valid but the Zoom meeting hasn&rsquo;t been configured
            yet. Please contact{" "}
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
