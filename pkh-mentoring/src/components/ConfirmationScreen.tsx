"use client";

interface ConfirmationScreenProps {
  firstName: string;
  dayAndTime: string;
  firstCallDate: string;
  groupLabel?: string | null;
  showGroupLabels: boolean;
  zoomLink?: string | null;
}

export default function ConfirmationScreen({
  firstName,
  dayAndTime,
  firstCallDate,
  groupLabel,
  showGroupLabels,
  zoomLink,
}: ConfirmationScreenProps) {
  return (
    <div className="space-y-6 print:space-y-4">
      {/* Success heading */}
      <div className="text-center">
        <div className="mb-3 text-5xl">{"\u2705"}</div>
        <h1 className="text-2xl font-bold text-navy-dark">
          You&rsquo;re all set, {firstName}!
        </h1>
        <p className="mt-2 text-warm-grey">
          Your mentoring slot has been confirmed.
        </p>
      </div>

      {/* Details card */}
      <div className="rounded-xl bg-sand p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-warm-grey">
            Your Call Time
          </p>
          <p className="mt-1 text-xl font-bold text-navy-dark">
            {dayAndTime}, fortnightly
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-warm-grey">
            First Mentoring Call
          </p>
          <p className="mt-1 text-lg font-semibold text-navy">
            {firstCallDate}
          </p>
        </div>

        {showGroupLabels && groupLabel && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-warm-grey">
              Group
            </p>
            <p className="mt-1 text-lg font-semibold text-navy">
              {groupLabel}
            </p>
          </div>
        )}

        {zoomLink && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-warm-grey">
              Zoom Link
            </p>
            <a
              href={zoomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
            >
              Join Zoom Meeting
            </a>
          </div>
        )}
      </div>

      {/* Gold divider */}
      <div className="h-0.5 bg-gold" />

      {/* Locked notice */}
      <div className="rounded-lg border border-sand-dark bg-warm-white p-4 text-center">
        <p className="text-sm text-warm-grey">
          Your selection is locked. If you need to change this, contact your
          enrolment coach or{" "}
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
