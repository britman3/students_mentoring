"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, Save } from "lucide-react";
import { Toast } from "@/components/ui/toast";
import { PageSkeleton } from "@/components/ui/loading-skeleton";

interface SettingsData {
  globalCapacity: number;
  week1AnchorDate: string;
  showGroupLabels: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [capacity, setCapacity] = useState(4);
  const [anchorDate, setAnchorDate] = useState("");
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setCapacity(data.globalCapacity);
        setAnchorDate(data.week1AnchorDate?.split("T")[0] ?? "");
        setShowLabels(data.showGroupLabels);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          globalCapacity: capacity,
          week1AnchorDate: anchorDate,
          showGroupLabels: showLabels,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        setToast({ message: "Settings saved successfully", type: "success" });
      } else {
        const err = await res.json();
        setToast({ message: err.error || "Failed to save settings", type: "error" });
      }
    } catch {
      setToast({ message: "Failed to save settings", type: "error" });
    } finally {
      setSaving(false);
    }
  }, [capacity, anchorDate, showLabels]);

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Settings</h1>
      <p className="text-warmGrey text-sm mb-8">Configure programme settings</p>

      <div className="max-w-2xl space-y-8">
        {/* Capacity Section */}
        <section>
          <h2 className="text-lg font-semibold text-navy mb-4">Capacity</h2>
          <div className="bg-white rounded-lg shadow-sm p-5">
            <label htmlFor="capacity" className="block text-sm font-medium text-warmGrey mb-1">
              Students per slot instance
            </label>
            <input
              id="capacity"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
              className="w-32 rounded-md border border-stone px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
            />
            <p className="text-xs text-warmGrey mt-2">
              Cannot be reduced below the current maximum enrolment in any single instance.
            </p>
          </div>
        </section>

        <hr className="border-stone" />

        {/* Week 1 Anchor Date */}
        <section>
          <h2 className="text-lg font-semibold text-navy mb-4">Week 1 Anchor Date</h2>
          <div className="bg-white rounded-lg shadow-sm p-5">
            <label htmlFor="anchor" className="block text-sm font-medium text-warmGrey mb-1">
              Start of Week 1
            </label>
            <input
              id="anchor"
              type="date"
              value={anchorDate}
              onChange={(e) => setAnchorDate(e.target.value)}
              className="w-48 rounded-md border border-stone px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
            />
            <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md p-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">
                Changing this date will affect how week numbers are calculated for all students.
                Existing group labels will not be automatically updated.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-stone" />

        {/* Student Visibility */}
        <section>
          <h2 className="text-lg font-semibold text-navy mb-4">Student Visibility</h2>
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warmGrey">Show group labels to students</p>
                <p className="text-xs text-warmGrey mt-0.5">
                  When enabled, students will see their group label on their confirmation page.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showLabels}
                onClick={() => setShowLabels(!showLabels)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showLabels ? "bg-gold" : "bg-stone"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showLabels ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-gold text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gold-dark transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
