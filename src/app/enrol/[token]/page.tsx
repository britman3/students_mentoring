"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

interface SlotOption {
  id: string;
  weekNumber: number;
  groupLabel: string;
  available: number;
  slot: { day: string; time: string };
}

interface StudentInfo {
  firstName: string;
  lastName: string;
  email: string;
}

export default function EnrolPage() {
  const params = useParams();
  const token = params.token as string;

  const [step, setStep] = useState<"loading" | "form" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedGroup, setConfirmedGroup] = useState("");

  useEffect(() => {
    fetch(`/api/enrol/validate?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setErrorMsg(data.error);
          setStep("error");
        } else {
          setStudent(data.student);
          setSlots(data.slots);
          setStep("form");
        }
      })
      .catch(() => {
        setErrorMsg("Unable to load enrolment form");
        setStep("error");
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/enrol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, slotInstanceId: selectedSlot, phone }),
      });

      if (res.ok) {
        const data = await res.json();
        setConfirmedGroup(data.slotInstance?.groupLabel ?? "");
        setStep("success");
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to enrol");
        setStep("error");
      }
    } catch {
      setErrorMsg("Something went wrong");
      setStep("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-light flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy">PKH Mentoring</h1>
          <p className="text-warmGrey mt-1">Student Enrolment</p>
        </div>

        {step === "loading" && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Loader2 className="w-8 h-8 text-gold mx-auto animate-spin" />
            <p className="text-warmGrey mt-4">Loading your enrolment form...</p>
          </div>
        )}

        {step === "error" && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-navy mb-2">Unable to Enrol</h2>
            <p className="text-warmGrey">{errorMsg}</p>
          </div>
        )}

        {step === "form" && student && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <p className="text-sm text-warmGrey">
                Welcome, <span className="font-medium text-navy">{student.firstName} {student.lastName}</span>
              </p>
              <p className="text-sm text-warmGrey mt-1">
                Please choose your preferred mentoring slot below.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-warmGrey mb-2">
                Phone Number (optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-stone px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                placeholder="07..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warmGrey mb-2">
                Choose your slot
              </label>
              <div className="space-y-2">
                {slots.map((slot) => (
                  <label
                    key={slot.id}
                    className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedSlot === slot.id
                        ? "border-gold bg-gold/5"
                        : slot.available > 0
                        ? "border-stone hover:border-gold/50"
                        : "border-stone bg-sand opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <input
                      type="radio"
                      name="slot"
                      value={slot.id}
                      disabled={slot.available <= 0}
                      checked={selectedSlot === slot.id}
                      onChange={() => setSelectedSlot(slot.id)}
                      className="text-gold focus:ring-gold"
                    />
                    <div>
                      <p className="text-sm font-medium text-navy">
                        {slot.slot.day} at {slot.slot.time} — Week {slot.weekNumber}
                      </p>
                      <p className="text-xs text-warmGrey">
                        {slot.available > 0
                          ? `${slot.available} spot${slot.available !== 1 ? "s" : ""} available`
                          : "Full"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedSlot || submitting}
              className="w-full bg-gold text-white py-2.5 rounded-md text-sm font-medium hover:bg-gold-dark transition-colors disabled:opacity-50"
            >
              {submitting ? "Enrolling..." : "Confirm Enrolment"}
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-navy mb-2">You are enrolled!</h2>
            <p className="text-warmGrey">
              Your mentoring slot has been confirmed.
            </p>
            {confirmedGroup && (
              <p className="text-sm text-navy mt-3 font-medium bg-sand rounded-md p-3">
                Group: {confirmedGroup}
              </p>
            )}
            <p className="text-xs text-warmGrey mt-6">
              You will receive a confirmation email shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
