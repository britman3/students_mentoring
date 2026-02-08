"use client";

import { useEffect, useState } from "react";
import { BarChart3, Users, Target, Clock } from "lucide-react";

interface PerSlotStat {
  displayName: string;
  groupCodeWeek1: string | null;
  groupCodeWeek2: string | null;
  week1Count: number;
  week2Count: number;
  total: number;
  capacity: number;
  utilisation: number;
}

interface WaitlistCount {
  displayName: string;
  count: number;
}

interface CloserStat {
  closerName: string;
  studentCount: number;
}

interface Stats {
  totalStudents: number;
  totalCapacity: number;
  overallUtilisation: number;
  perSlot: PerSlotStat[];
  waitlistCounts: WaitlistCount[];
  closerStats: CloserStat[];
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-navy">Statistics</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-sand-dark shadow-sm p-6">
              <div className="h-4 w-24 bg-sand animate-pulse rounded mb-3" />
              <div className="h-8 w-16 bg-sand animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-navy mb-6">Statistics</h1>
        <div className="bg-white rounded-lg border border-sand-dark shadow-sm p-12 text-center">
          <BarChart3 size={48} className="text-sand-dark mx-auto mb-4" />
          <p className="text-warm-grey">No data to display yet</p>
        </div>
      </div>
    );
  }

  function getBarColor(pct: number) {
    if (pct > 90) return "bg-error";
    if (pct > 70) return "bg-warning";
    return "bg-success";
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy mb-6">Statistics</h1>

      {/* Overview stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-sand-dark shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-warm-grey"><Users size={20} /></div>
            <span className="text-sm font-medium text-warm-grey">Total Students</span>
          </div>
          <div className="text-3xl font-semibold text-navy">{stats.totalStudents}</div>
        </div>
        <div className="bg-white rounded-lg border border-sand-dark shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-warm-grey"><Target size={20} /></div>
            <span className="text-sm font-medium text-warm-grey">Total Capacity</span>
          </div>
          <div className="text-3xl font-semibold text-navy">{stats.totalCapacity}</div>
        </div>
        <div className="bg-white rounded-lg border border-sand-dark shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-warm-grey"><BarChart3 size={20} /></div>
            <span className="text-sm font-medium text-warm-grey">Utilisation</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold text-navy">{stats.overallUtilisation}%</span>
          </div>
          <div className="mt-2 h-3 bg-sand-dark/30 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getBarColor(stats.overallUtilisation)}`}
              style={{ width: `${Math.min(stats.overallUtilisation, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Per-slot breakdown table */}
      <div className="bg-white rounded-lg border border-sand-dark shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-sand-dark">
          <h2 className="text-lg font-semibold text-navy">Per-Slot Breakdown</h2>
        </div>
        {stats.perSlot.length === 0 ? (
          <div className="p-12 text-center">
            <Clock size={48} className="text-sand-dark mx-auto mb-4" />
            <p className="text-warm-grey">No slots configured</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sand-dark bg-sand">
                  <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Display Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Week 1</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Week 2</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Capacity</th>
                </tr>
              </thead>
              <tbody>
                {stats.perSlot.map((slot, i) => (
                  <tr key={slot.displayName} className={i % 2 === 1 ? "bg-sand" : "bg-white"}>
                    <td className="px-6 py-3 text-sm font-medium text-charcoal">{slot.displayName}</td>
                    <td className="px-6 py-3 text-sm text-charcoal">
                      {slot.groupCodeWeek1 && (
                        <span className="inline-flex items-center gap-1">
                          <span className="text-xs font-medium text-navy bg-navy/10 px-1.5 py-0.5 rounded">{slot.groupCodeWeek1}</span>
                          <span>{slot.week1Count}/{slot.capacity}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-charcoal">
                      {slot.groupCodeWeek2 && (
                        <span className="inline-flex items-center gap-1">
                          <span className="text-xs font-medium text-navy bg-navy/10 px-1.5 py-0.5 rounded">{slot.groupCodeWeek2}</span>
                          <span>{slot.week2Count}/{slot.capacity}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-navy">{slot.total}</td>
                    <td className="px-6 py-3">
                      <div className="w-28">
                        <div className="h-2.5 bg-sand-dark/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getBarColor(slot.utilisation)}`}
                            style={{ width: `${Math.min(slot.utilisation, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-warm-grey mt-1">{slot.utilisation}%</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Waitlist section */}
      <div className="bg-white rounded-lg border border-sand-dark shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-sand-dark">
          <h2 className="text-lg font-semibold text-navy">Waitlist</h2>
        </div>
        {stats.waitlistCounts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-warm-grey">No one on the waitlist</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sand-dark bg-sand">
                  <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Slot</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Waiting</th>
                </tr>
              </thead>
              <tbody>
                {stats.waitlistCounts.map((wc, i) => (
                  <tr key={wc.displayName} className={i % 2 === 1 ? "bg-sand" : "bg-white"}>
                    <td className="px-6 py-3 text-sm text-charcoal">{wc.displayName}</td>
                    <td className="px-6 py-3 text-sm font-medium text-navy">{wc.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Closer performance section */}
      {stats.closerStats.length > 0 && (
        <div className="bg-white rounded-lg border border-sand-dark shadow-sm">
          <div className="px-6 py-4 border-b border-sand-dark">
            <h2 className="text-lg font-semibold text-navy">Closer Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sand-dark bg-sand">
                  <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Closer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Students</th>
                </tr>
              </thead>
              <tbody>
                {stats.closerStats.map((cs, i) => (
                  <tr key={cs.closerName} className={i % 2 === 1 ? "bg-sand" : "bg-white"}>
                    <td className="px-6 py-3 text-sm text-charcoal">{cs.closerName}</td>
                    <td className="px-6 py-3 text-sm font-medium text-navy">{cs.studentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
