import { prisma } from "@/lib/db";
import { MagicLinkStatus } from "@prisma/client";
import { getDayName, formatDisplayTime } from "@/lib/display";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import ConfirmationScreen from "@/components/ConfirmationScreen";
import EnrolmentForm from "@/components/EnrolmentForm";

export const dynamic = "force-dynamic";

export default async function EnrolPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const magicLink = await prisma.magicLink.findUnique({
    where: { token },
  });

  // Invalid token
  if (!magicLink) {
    return (
      <PageShell>
        <ErrorView
          title="Invalid Link"
          message="This enrolment link is not valid. Please check the link you were sent or contact support."
        />
      </PageShell>
    );
  }

  // Expired by date
  if (magicLink.expiresAt && magicLink.expiresAt < new Date()) {
    return (
      <PageShell>
        <ErrorView
          title="Link Expired"
          message="This enrolment link has expired. Please contact your enrolment coach for a new link."
        />
      </PageShell>
    );
  }

  // Expired or revoked status
  if (
    magicLink.status === MagicLinkStatus.EXPIRED ||
    magicLink.status === MagicLinkStatus.REVOKED
  ) {
    return (
      <PageShell>
        <ErrorView
          title={
            magicLink.status === MagicLinkStatus.EXPIRED
              ? "Link Expired"
              : "Link Revoked"
          }
          message={
            magicLink.status === MagicLinkStatus.EXPIRED
              ? "This enrolment link has expired. Please contact your enrolment coach for a new link."
              : "This enrolment link has been revoked. Please contact support if you believe this is an error."
          }
        />
      </PageShell>
    );
  }

  // Completed — show read-only confirmation
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

    if (!student || !student.slotInstance) {
      return (
        <PageShell>
          <ErrorView
            title="Already Used"
            message="This enrolment link has already been used. Contact support if you need help."
          />
        </PageShell>
      );
    }

    const settings = await prisma.settings.findFirst();
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

    return (
      <PageShell>
        <ConfirmationScreen
          firstName={student.firstName}
          dayAndTime={`${dayName} ${displayTime}`}
          firstCallDate={formattedFirstCallDate}
          groupLabel={student.slotInstance.groupLabel}
          showGroupLabels={settings?.showGroupLabels ?? false}
          zoomLink={slot.zoomLink}
        />
      </PageShell>
    );
  }

  // Valid token (UNUSED, OPENED, SENT) — update to OPENED on first visit
  if (magicLink.status === MagicLinkStatus.UNUSED) {
    await prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { status: MagicLinkStatus.OPENED },
    });
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy-dark">
            Welcome to PKH Mentoring
          </h1>
          <p className="mt-2 text-warm-grey">
            Complete the form below to secure your mentoring slot.
          </p>
        </div>
        <EnrolmentForm token={token} />
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen justify-center bg-warm-white px-4 py-8 sm:py-12">
      <div className="w-full max-w-[640px]">
        {/* PKH Logo / Brand Header */}
        <div className="mb-8 text-center">
          <div className="inline-block rounded-lg bg-navy px-5 py-2.5">
            <span className="text-lg font-bold tracking-wide text-white">
              Property Know How
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-sand-dark bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-warm-grey">
          Need help?{" "}
          <a
            href="mailto:support@propertyknowhow.com"
            className="text-navy underline"
          >
            support@propertyknowhow.com
          </a>
        </p>
      </div>
    </div>
  );
}

function ErrorView({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
        <svg
          className="h-7 w-7 text-error"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-navy-dark">{title}</h1>
      <p className="mt-2 text-warm-grey">{message}</p>
    </div>
  );
}
