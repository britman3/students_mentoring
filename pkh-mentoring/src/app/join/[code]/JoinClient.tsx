"use client";

interface JoinClientProps {
  studentName: string;
  slotDay: string;
  slotTime: string;
  groupCode: string;
  zoomLink: string;
  zoomAppUrl: string;
}

export default function JoinClient({
  studentName,
  slotDay,
  slotTime,
  groupCode,
  zoomLink,
  zoomAppUrl,
}: JoinClientProps) {
  function openInBrowser() {
    window.open(zoomLink, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-white px-4">
      <div className="w-full max-w-md">
        {/* Navy header card */}
        <div className="rounded-t-lg bg-navy px-6 py-8 text-center">
          <img
            src="/pkh_logo.png"
            alt="Property Know How"
            className="mx-auto mb-4 h-12"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <h1 className="text-2xl font-bold text-white">
            Join Your Mentoring Call
          </h1>
        </div>

        {/* Body */}
        <div className="rounded-b-lg border border-t-0 border-sand-dark bg-white px-6 py-8">
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between border-b border-sand pb-2">
              <span className="text-sm text-warm-grey">Name</span>
              <span className="text-sm font-medium text-charcoal">
                {studentName}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-sand pb-2">
              <span className="text-sm text-warm-grey">Day &amp; Time</span>
              <span className="text-sm font-medium text-charcoal">
                {slotDay} {slotTime}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-sand pb-2">
              <span className="text-sm text-warm-grey">Group</span>
              <span className="text-sm font-medium text-charcoal">
                {groupCode}
              </span>
            </div>
          </div>

          <p className="mb-6 text-center text-sm text-warm-grey">
            Your call is via Zoom. Click below to join.
          </p>

          {/* Primary: Open in Zoom App */}
          {zoomAppUrl ? (
            <a
              href={zoomAppUrl}
              className="mb-4 block w-full rounded-md bg-navy px-6 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-navy-light"
            >
              Open in Zoom App
            </a>
          ) : (
            <button
              onClick={openInBrowser}
              className="mb-4 w-full rounded-md bg-navy px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-navy-light"
            >
              Join Your Call
            </button>
          )}

          {/* Fallback: Open in browser */}
          {zoomAppUrl && (
            <div className="text-center">
              <button
                onClick={openInBrowser}
                className="text-sm text-warm-grey underline transition-colors hover:text-navy"
              >
                Can&apos;t open the app? Join in browser
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
