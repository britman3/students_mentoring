"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy mb-6">Settings</h1>
      <div className="bg-white rounded-lg border border-sand-dark shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings size={24} className="text-navy" />
          <h2 className="text-lg font-semibold text-navy">Application Settings</h2>
        </div>
        <div className="space-y-6">
          <div className="border-b border-sand-dark pb-4">
            <h3 className="text-sm font-medium text-charcoal mb-1">Admin Password</h3>
            <p className="text-sm text-warm-grey">Configured via ADMIN_PASSWORD environment variable or Settings table hash</p>
          </div>
          <div className="border-b border-sand-dark pb-4">
            <h3 className="text-sm font-medium text-charcoal mb-1">Database</h3>
            <p className="text-sm text-warm-grey">PostgreSQL (configured via DATABASE_URL)</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-charcoal mb-1">Capacity per Instance</h3>
            <p className="text-sm text-warm-grey">Configured in Settings table (default: 12)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
