import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { ActivityType } from "@prisma/client";
import { getLastCallDate } from "@/lib/dates";
import { getDayName, formatDisplayTime } from "@/lib/display";
import JoinClient from "./JoinClient";

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

  // Check if support has ended (today > last call date)
  if (student.firstCallDate) {
    const lastCallDate = getLastCallDate(student.firstCallDate);
    const now = new Date();
    if (now > lastCallDate) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-warm-white px-4">
          <div className="max-w-md text-center">
            <div className="mb-4 text-5xl">{"\u23F0"}</div>
            <h1 className="mb-3 text-2xl font-bold text-navy-dark">
              Support Ended
            </h1>
            <p className="text-warm-grey">
              Your mentoring support period has ended. If you believe this is an
              error or would like to discuss your options, please contact{" "}
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

  // Log attendance (30-minute deduplication)
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const recentAttendance = await prisma.attendance.findFirst({
    where: {
      studentId: student.id,
      accessedAt: { gt: thirtyMinutesAgo },
    },
  });

  if (!recentAttendance) {
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      null;
    const userAgent = headersList.get("user-agent") || null;

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

  // Build zoommtg:// protocol URL
  let zoomAppUrl = "";
  try {
    const url = new URL(zoomLink);
    const meetingId = url.pathname.split("/j/")[1]?.split("?")[0];
    if (meetingId) {
      const pwd = url.searchParams.get("pwd");
      zoomAppUrl = `zoommtg://zoom.us/join?confno=${meetingId}`;
      if (pwd) {
        zoomAppUrl += `&pwd=${pwd}`;
      }
    }
  } catch {
    // If URL parsing fails, leave zoomAppUrl empty
  }

  const slotDay = getDayName(student.slotInstance.slot.dayOfWeek);
  const slotTime = formatDisplayTime(student.slotInstance.slot.time);
  const groupCode = student.slotInstance.groupCode;

  return (
    <JoinClient
      studentName={`${student.firstName} ${student.lastName}`}
      slotDay={slotDay}
      slotTime={slotTime}
      groupCode={groupCode}
      zoomLink={zoomLink}
      zoomAppUrl={zoomAppUrl}
    />
  );
}
