"use client";

import { useEffect, useState } from "react";
import { Settings, AlertTriangle, Check } from "lucide-react";

interface SettingsData {
  id: number;
  capacity: number;
  anchorDate: string;
  showGroupCodes: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Settings form state
  const [capacity, setCapacity] = useState(12);
  const [anchorDate, setAnchorDate] = useState("2026-01-06");
  const [showGroupCodes, setShowGroupCodes] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data: SettingsData) => {
        setSettings(data);
        setCapacity(data.capacity);
        setAnchorDate(data.anchorDate.split("T")[0]);
        setShowGroupCodes(data.showGroupCodes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsError("");
    setSettingsSuccess("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capacity, anchorDate, showGroupCodes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSettingsError(data.error || "Failed to save settings");
        return;
      }
      setSettings(data);
      setSettingsSuccess("Settings saved successfully");
      setTimeout(() => setSettingsSuccess(""), 3000);
    } catch {
      setSettingsError("A network error occurred");
    } finally {
      setSettingsSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setPasswordSaving(true);

    try {
      const res = await fetch("/api/admin/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Failed to change password");
        return;
      }
      setPasswordSuccess("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch {
      setPasswordError("A network error occurred");
    } finally {
      setPasswordSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-navy">Settings</h1>
        <div className="bg-white rounded-lg border border-sand-dark shadow-sm p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-sand animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy mb-6">Settings</h1>

      <div className="space-y-6">
        {/* General Settings Form */}
        <form onSubmit={saveSettings}>
          <div className="bg-white rounded-lg border border-sand-dark shadow-sm">
            <div className="px-6 py-4 border-b border-sand-dark">
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-navy" />
                <h2 className="text-lg font-semibold text-navy">Application Settings</h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Capacity */}
              <div>
                <h3 className="text-sm font-semibold text-navy mb-2">Capacity per Instance</h3>
                <p className="text-sm text-warm-grey mb-3">
                  Maximum number of students per slot instance (per week).
                </p>
                <input
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 1)}
                  className="w-32 px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm"
                />
              </div>

              <div className="h-px bg-sand-dark" />

              {/* Anchor Date */}
              <div>
                <h3 className="text-sm font-semibold text-navy mb-2">Week 1 Anchor Date</h3>
                <p className="text-sm text-warm-grey mb-3">
                  The Monday that starts the Week 1 / Week 2 cycle.
                </p>
                <input
                  type="date"
                  value={anchorDate}
                  onChange={(e) => setAnchorDate(e.target.value)}
                  className="w-48 px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm"
                />
                <div className="mt-3 flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-md">
                  <AlertTriangle size={16} className="text-warning mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-charcoal">
                    Changing this date will affect which weeks are Week 1 and Week 2 for all slots. Existing student assignments will not change, but future calculations will use the new anchor.
                  </p>
                </div>
              </div>

              <div className="h-px bg-sand-dark" />

              {/* Show Group Codes */}
              <div>
                <h3 className="text-sm font-semibold text-navy mb-2">Show Group Codes to Students</h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowGroupCodes(!showGroupCodes)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showGroupCodes ? "bg-success" : "bg-sand-dark"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showGroupCodes ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-charcoal">
                    Show group codes (e.g. W1G) on the student confirmation screen and email
                  </span>
                </div>
              </div>
            </div>

            {/* Settings save */}
            <div className="px-6 py-4 border-t border-sand-dark flex items-center gap-4">
              <button
                type="submit"
                disabled={settingsSaving}
                className="px-6 py-2 text-sm font-medium bg-gold hover:bg-gold-dark text-white rounded-md transition-colors disabled:opacity-50"
              >
                {settingsSaving ? "Saving..." : "Save Settings"}
              </button>
              {settingsError && (
                <p className="text-sm text-error">{settingsError}</p>
              )}
              {settingsSuccess && (
                <span className="flex items-center gap-1 text-sm text-success">
                  <Check size={14} /> {settingsSuccess}
                </span>
              )}
            </div>
          </div>
        </form>

        {/* Change Password Form */}
        <form onSubmit={changePassword}>
          <div className="bg-white rounded-lg border border-sand-dark shadow-sm">
            <div className="px-6 py-4 border-b border-sand-dark">
              <h2 className="text-lg font-semibold text-navy">Change Admin Password</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full max-w-sm px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm"
                  autoComplete="current-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full max-w-sm px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full max-w-sm px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-sand-dark flex items-center gap-4">
              <button
                type="submit"
                disabled={passwordSaving}
                className="px-6 py-2 text-sm font-medium bg-gold hover:bg-gold-dark text-white rounded-md transition-colors disabled:opacity-50"
              >
                {passwordSaving ? "Updating..." : "Change Password"}
              </button>
              {passwordError && (
                <p className="text-sm text-error">{passwordError}</p>
              )}
              {passwordSuccess && (
                <span className="flex items-center gap-1 text-sm text-success">
                  <Check size={14} /> {passwordSuccess}
                </span>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
