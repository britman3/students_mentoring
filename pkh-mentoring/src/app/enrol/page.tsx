"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EnrolmentForm from "@/components/EnrolmentForm";

interface ExistingConfirmation {
  firstName: string;
  dayTime: string;
  firstCallDate: string | null;
  lastCallDate: string | null;
  groupCode: string;
  joinLink: string;
  showGroupCodes: boolean;
}

function EnrolPageContent() {
  const searchParams = useSearchParams();

  const paramFirstName = searchParams.get("firstName") || null;
  const paramLastName = searchParams.get("lastName") || null;
  const paramEmail = searchParams.get("email") || null;
  const paramPhone = searchParams.get("phone") || null;
  const paramCloser = searchParams.get("closer") || null;

  const allParamsPresent = !!(paramFirstName && paramLastName && paramEmail && paramPhone);

  const [checking, setChecking] = useState(!!paramEmail);
  const [existing, setExisting] = useState<ExistingConfirmation | null>(null);

  // Check if email already enrolled
  useEffect(() => {
    if (!paramEmail) return;

    async function checkEmail() {
      try {
        const res = await fetch(
          `/api/enrol/check?email=${encodeURIComponent(paramEmail!)}`
        );
        const data = await res.json();
        if (data.exists) {
          setExisting(data.confirmation);
        }
      } catch {
        // If check fails, just show the form
      } finally {
        setChecking(false);
      }
    }

    checkEmail();
  }, [paramEmail]);

  // Loading state while checking email
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-white">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <span className="text-warm-grey">Checking your details...</span>
        </div>
      </div>
    );
  }

  // Already enrolled — read-only confirmation
  if (existing) {
    return (
      <div className="min-h-screen bg-warm-white">
        <div className="mx-auto max-w-[640px] px-4 py-8 sm:py-12">
          {/* Logo */}
          <div className="mb-8 text-center">
            <img
              src="/pkh_logo.svg"
              alt="Property Know How"
              className="mx-auto h-16 w-auto"
            />
          </div>

          <div className="rounded-2xl border border-sand-dark bg-white p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="mb-3 text-5xl">{"\u2705"}</div>
              <h1 className="text-2xl font-bold text-navy-dark">
                You&rsquo;ve already selected your mentoring slot.
              </h1>
            </div>

            <div className="rounded-xl bg-[#F3F0EA] p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-warm-grey">
                  Your Call Time
                </p>
                <p className="mt-1 text-xl font-bold text-navy-dark">
                  {existing.dayTime}, fortnightly
                </p>
              </div>

              {existing.firstCallDate && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-warm-grey">
                    First Mentoring Call
                  </p>
                  <p className="mt-1 text-lg font-semibold text-navy">
                    {existing.firstCallDate}
                  </p>
                </div>
              )}

              {existing.lastCallDate && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-warm-grey">
                    Last Mentoring Call
                  </p>
                  <p className="mt-1 text-lg font-semibold text-navy">
                    {existing.lastCallDate}
                  </p>
                </div>
              )}

              {existing.groupCode && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-warm-grey">
                    Your Group
                  </p>
                  <p className="mt-1 text-lg font-semibold text-navy">
                    {existing.groupCode}
                  </p>
                </div>
              )}

              {existing.joinLink && (
                <div className="pt-2">
                  <a
                    href={existing.joinLink}
                    className="inline-block rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
                  >
                    Join Your Mentoring Call
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-warm-grey">
                If you need to make changes, contact{" "}
                <a
                  href="mailto:support@propertyknowhow.com"
                  className="font-medium text-navy underline"
                >
                  support@propertyknowhow.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show enrolment form
  return (
    <div className="min-h-screen bg-warm-white">
      <div className="mx-auto max-w-[640px] px-4 py-8 sm:py-12">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img
            src="/pkh_logo.svg"
            alt="Property Know How"
            className="mx-auto h-16 w-auto"
          />
        </div>

        {/* Heading */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-navy-dark">
            Select Your Mentoring Slot
          </h1>
          <p className="mt-2 text-warm-grey">
            Choose a time that works best for you.
          </p>
        </div>

        {/* Pre-filled info bar */}
        {allParamsPresent && (
          <div className="mb-6 rounded-lg bg-[#F3F0EA] px-4 py-3 text-sm text-navy">
            {"\u2714"} We&rsquo;ve filled in your details from your enrolment. Please
            check they&rsquo;re correct before selecting your slot.
          </div>
        )}

        {/* Form card */}
        <div className="rounded-2xl border border-sand-dark bg-white p-6 sm:p-8 shadow-sm">
          <EnrolmentForm
            initialFirstName={paramFirstName}
            initialLastName={paramLastName}
            initialEmail={paramEmail}
            initialPhone={paramPhone}
            closer={paramCloser}
          />
        </div>
      </div>
    </div>
  );
}

export default function EnrolPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-warm-white">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            <span className="text-warm-grey">Loading...</span>
          </div>
        </div>
      }
    >
      <EnrolPageContent />
    </Suspense>
  );
}
