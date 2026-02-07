"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

interface Stats {
  totalStudents: number;
  totalCapacity: number;
  openSlots: number;
  waitlistCount: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats/summary")
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-warm-grey">Loading...</div></div>;
  }

  const utilizationPct = stats && stats.totalCapacity > 0
    ? Math.round((stats.totalStudents / stats.totalCapacity) * 100) : 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy mb-6">Statistics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-sand-dark shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-navy" />
            <h2 className="text-lg font-semibold text-navy">Overall Utilization</h2>
          </div>
          <div className="flex items-end gap-4 mb-4">
            <span className="text-5xl font-bold text-navy">{utilizationPct}%</span>
            <span className="text-sm text-warm-grey pb-2">{stats?.totalStudents ?? 0} / {stats?.totalCapacity ?? 0} spots filled</span>
          </div>
          <div className="h-4 bg-sand-dark/30 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${utilizationPct > 90 ? "bg-error" : utilizationPct > 70 ? "bg-warning" : "bg-success"}`}
              style={{ width: `${Math.min(utilizationPct, 100)}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-sand-dark shadow-sm p-6">
          <h2 className="text-lg font-semibold text-navy mb-4">Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-sand-dark/50">
              <span className="text-sm text-warm-grey">Active Students</span>
              <span className="text-lg font-semibold text-navy">{stats?.totalStudents ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-sand-dark/50">
              <span className="text-sm text-warm-grey">Total Capacity</span>
              <span className="text-lg font-semibold text-navy">{stats?.totalCapacity ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-sand-dark/50">
              <span className="text-sm text-warm-grey">Open Slots</span>
              <span className="text-lg font-semibold text-navy">{stats?.openSlots ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-warm-grey">Waitlist</span>
              <span className="text-lg font-semibold text-navy">{stats?.waitlistCount ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
