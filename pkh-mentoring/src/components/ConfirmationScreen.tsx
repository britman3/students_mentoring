"use client";

interface ConfirmationScreenProps {
  firstName: string;
  dayAndTime: string;
  firstCallDate: string;
  lastCallDate: string;
  groupCode?: string | null;
  showGroupCodes: boolean;
  joinLink: string;
}

export default function ConfirmationScreen({
  firstName,
  dayAndTime,
  firstCallDate,
  lastCallDate,
  groupCode,
  showGroupCodes,
  joinLink,
}: ConfirmationScreenProps) {
  return (
    <div className="space-y-6 print:space-y-4">
      {/* Success heading */}
      <div className="text-center">
        <div className="mb-3 text-5xl">{"\u2705"}</div>
        <h1 className="text-2xl font-bold text-navy-dark">
          You&rsquo;re all set!
        </h1>
        <p className="mt-2 text-warm-grey">
          Your mentoring slot has been confirmed, {firstName}.
        </p>
      </div>

      {/* Details card */}
      <div className="rounded-xl bg-[#F3F0EA] p-6 space-y-4">
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

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-warm-grey">
            Last Mentoring Call
          </p>
          <p className="mt-1 text-lg font-semibold text-navy">
            {lastCallDate}
          </p>
        </div>

        {groupCode && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-warm-grey">
              Your Group
            </p>
            <p className="mt-1 text-lg font-semibold text-navy">
              {groupCode}
            </p>
          </div>
        )}

        <div className="pt-2">
          <a
            href={joinLink}
            className="inline-block rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
          >
            Join Your Mentoring Call
          </a>
        </div>
      </div>

      {/* Gold divider */}
      <div className="h-0.5 bg-gold" />

      {/* Locked notice */}
      <div className="rounded-lg border border-sand-dark bg-warm-white p-4 text-center">
        <p className="text-sm font-medium text-navy-dark mb-1">
          Your selection is locked.
        </p>
        <p className="text-sm text-warm-grey">
          If you need to change this, contact{" "}
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
