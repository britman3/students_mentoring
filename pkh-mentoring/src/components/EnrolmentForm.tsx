"use client";

import { useState, useEffect, useCallback } from "react";
import ConfirmationScreen from "./ConfirmationScreen";

interface AvailableSlot {
  id: string;
  dayOfWeek: number;
  dayName: string;
  time: string;
  displayTime: string;
  availableSpots: number;
}

interface ConfirmationData {
  firstName: string;
  dayTime: string;
  firstCallDate: string;
  lastCallDate: string;
  groupCode: string;
  joinCode: string;
  joinLink: string;
  showGroupCodes: boolean;
  zoomLink?: string | null;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  confirmEmail?: string;
  slotId?: string;
  general?: string;
}

interface EnrolmentFormProps {
  initialFirstName?: string | null;
  initialLastName?: string | null;
  initialEmail?: string | null;
  initialPhone?: string | null;
  closer?: string | null;
}

export default function EnrolmentForm({
  initialFirstName,
  initialLastName,
  initialEmail,
  initialPhone,
  closer,
}: EnrolmentFormProps) {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState("");

  const [firstName, setFirstName] = useState(initialFirstName || "");
  const [lastName, setLastName] = useState(initialLastName || "");
  const [phone, setPhone] = useState(initialPhone || "");
  const [email, setEmail] = useState(initialEmail || "");
  const [confirmEmail, setConfirmEmail] = useState(initialEmail || "");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [wantWaitlist, setWantWaitlist] = useState(false);
  const [waitlistSlotId, setWaitlistSlotId] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(
    null
  );

  const isDirty =
    firstName !== (initialFirstName || "") ||
    lastName !== (initialLastName || "") ||
    phone !== (initialPhone || "") ||
    email !== (initialEmail || "") ||
    confirmEmail !== (initialEmail || "") ||
    selectedSlotId !== "";

  // Fetch available slots
  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await fetch("/api/slots/available");
        if (!res.ok) throw new Error("Failed to load slots");
        const data = await res.json();
        setSlots(data.slots);
      } catch {
        setSlotsError("Unable to load available time slots. Please refresh.");
      } finally {
        setSlotsLoading(false);
      }
    }
    fetchSlots();
  }, []);

  // Abandonment protection
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty && !confirmation) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, confirmation]);

  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};

    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (!lastName.trim()) errs.lastName = "Last name is required.";
    if (!phone.trim()) errs.phone = "Phone number is required.";

    if (!email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    if (!confirmEmail.trim()) {
      errs.confirmEmail = "Please confirm your email.";
    } else if (
      email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()
    ) {
      errs.confirmEmail = "Email addresses do not match.";
    }

    if (!selectedSlotId) errs.slotId = "Please select a time slot.";

    return errs;
  }, [firstName, lastName, phone, email, confirmEmail, selectedSlotId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setErrors({});

    try {
      const res = await fetch("/api/enrol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          slotId: selectedSlotId,
          closerName: closer || undefined,
          waitlistSlotId: wantWaitlist ? waitlistSlotId : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.error || "Something went wrong." });
        return;
      }

      setConfirmation(data.confirmation);
    } catch {
      setErrors({
        general: "A network error occurred. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Show confirmation after successful submission
  if (confirmation) {
    return (
      <ConfirmationScreen
        firstName={confirmation.firstName}
        dayAndTime={confirmation.dayTime}
        firstCallDate={confirmation.firstCallDate}
        lastCallDate={confirmation.lastCallDate}
        groupCode={confirmation.groupCode}
        showGroupCodes={confirmation.showGroupCodes}
        joinLink={confirmation.joinLink}
      />
    );
  }

  const waitlistOptions = slots.filter((s) => s.id !== selectedSlotId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <h2 className="text-xl font-bold text-navy-dark">Your Details</h2>
        <p className="mt-1 text-sm text-warm-grey">
          All fields are required.
        </p>
      </div>

      {/* Name fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-semibold text-navy"
          >
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={`mt-1 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-charcoal outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/30 ${
              errors.firstName ? "border-error" : "border-sand-dark"
            }`}
            placeholder="Jane"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-error">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-semibold text-navy"
          >
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={`mt-1 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-charcoal outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/30 ${
              errors.lastName ? "border-error" : "border-sand-dark"
            }`}
            placeholder="Smith"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-error">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-semibold text-navy"
        >
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={`mt-1 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-charcoal outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/30 ${
            errors.phone ? "border-error" : "border-sand-dark"
          }`}
          placeholder="07700 900000"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-error">{errors.phone}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-navy"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mt-1 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-charcoal outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/30 ${
            errors.email ? "border-error" : "border-sand-dark"
          }`}
          placeholder="jane@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-error">{errors.email}</p>
        )}
      </div>

      {/* Confirm Email */}
      <div>
        <label
          htmlFor="confirmEmail"
          className="block text-sm font-semibold text-navy"
        >
          Confirm Email
        </label>
        <input
          id="confirmEmail"
          type="email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          className={`mt-1 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-charcoal outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/30 ${
            errors.confirmEmail ? "border-error" : "border-sand-dark"
          }`}
          placeholder="jane@example.com"
        />
        {errors.confirmEmail && (
          <p className="mt-1 text-sm text-error">{errors.confirmEmail}</p>
        )}
      </div>

      {/* Slot selection */}
      <div>
        <h2 className="text-xl font-bold text-navy-dark">
          Choose Your Time Slot
        </h2>
        <p className="mt-1 text-sm text-warm-grey">
          All calls are fortnightly via Zoom.
        </p>

        {slotsLoading && (
          <div className="mt-4 flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            <span className="ml-2 text-sm text-warm-grey">
              Loading slots...
            </span>
          </div>
        )}

        {slotsError && (
          <p className="mt-4 text-sm text-error">{slotsError}</p>
        )}

        {!slotsLoading && !slotsError && slots.length === 0 && (
          <p className="mt-4 text-sm text-warm-grey">
            No slots are currently available. Please check back later or contact
            support.
          </p>
        )}

        {!slotsLoading && !slotsError && slots.length > 0 && (
          <div className="mt-4 space-y-3">
            {slots.map((slot) => (
              <label
                key={slot.id}
                className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                  selectedSlotId === slot.id
                    ? "border-gold bg-gold/5 shadow-sm"
                    : "border-sand-dark bg-white hover:border-gold/50"
                }`}
              >
                <input
                  type="radio"
                  name="slotId"
                  value={slot.id}
                  checked={selectedSlotId === slot.id}
                  onChange={(e) => setSelectedSlotId(e.target.value)}
                  className="h-5 w-5 accent-gold"
                />
                <div className="flex-1">
                  <p className="font-semibold text-navy-dark">
                    {slot.dayName} {slot.displayTime}
                  </p>
                  <p className="text-sm text-warm-grey">
                    Spots available
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        {errors.slotId && (
          <p className="mt-2 text-sm text-error">{errors.slotId}</p>
        )}
      </div>

      {/* Optional waitlist */}
      {selectedSlotId && waitlistOptions.length > 0 && (
        <div className="rounded-xl border border-sand-dark bg-sand/30 p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={wantWaitlist}
              onChange={(e) => {
                setWantWaitlist(e.target.checked);
                if (!e.target.checked) setWaitlistSlotId("");
              }}
              className="mt-0.5 h-5 w-5 accent-gold"
            />
            <div>
              <p className="font-medium text-navy">
                I&rsquo;d also like to join the waitlist for another slot
              </p>
              <p className="text-sm text-warm-grey">
                If a spot opens up in your preferred slot, we&rsquo;ll let you
                know.
              </p>
            </div>
          </label>

          {wantWaitlist && (
            <select
              value={waitlistSlotId}
              onChange={(e) => setWaitlistSlotId(e.target.value)}
              className="mt-3 block w-full rounded-lg border border-sand-dark bg-white px-3.5 py-2.5 text-charcoal outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
            >
              <option value="">Select a slot...</option>
              {waitlistOptions.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.dayName} {slot.displayTime}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* General error */}
      {errors.general && (
        <div className="rounded-lg border border-error/30 bg-error/5 p-4">
          <p className="text-sm font-medium text-error">{errors.general}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-gold py-3.5 text-base font-bold text-white shadow-sm transition-all hover:bg-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Confirming...
          </span>
        ) : (
          "Confirm My Slot"
        )}
      </button>
    </form>
  );
}
