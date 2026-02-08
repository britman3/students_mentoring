"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Clock,
  UserPlus,
  Plus,
  Download,
} from "lucide-react";

interface CloserStat {
  id: string;
  firstName: string;
  studentCount: number;
}

interface Stats {
  totalStudents: number;
  totalCapacity: number;
  openSlots: number;
  waitlistCount: number;
  closerStats: CloserStat[];
  recentEnrolments: {
    id: string;
    name: string;
    slot: string | null;
    week: number | null;
    group: string | null;
    enrolledAt: string;
  }[];
}

export default function AdminDashboardPage() {
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-warm-grey">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users size={20} />}
          label="Total Students"
          value={stats?.totalStudents ?? 0}
        />
        <StatCard
          icon={<Calendar size={20} />}
          label="Total Capacity"
          value={stats?.totalCapacity ?? 0}
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Open Slots"
          value={stats?.openSlots ?? 0}
        />
        <StatCard
          icon={<UserPlus size={20} />}
          label="Waitlist"
          value={stats?.waitlistCount ?? 0}
        />
      </div>

      {/* Students per Closer */}
      {stats?.closerStats && stats.closerStats.length > 0 && (
        <div className="bg-white rounded-lg border border-sand-dark shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-sand-dark">
            <h2 className="text-lg font-semibold text-navy">
              Students per Closer
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-2">
              {stats.closerStats.map((closer) => (
                <div
                  key={closer.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-charcoal font-medium">
                    {closer.firstName}
                  </span>
                  <span className="text-warm-grey">
                    {closer.studentCount} student
                    {closer.studentCount !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Enrolments */}
      <div className="bg-white rounded-lg border border-sand-dark shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-sand-dark">
          <h2 className="text-lg font-semibold text-navy">
            Recent Enrolments
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sand-dark bg-sand">
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Slot
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Week
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Group Code
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Enrolled
                </th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentEnrolments.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-warm-grey"
                  >
                    No enrolments yet
                  </td>
                </tr>
              )}
              {stats?.recentEnrolments.map((student, i) => (
                <tr
                  key={student.id}
                  className={i % 2 === 1 ? "bg-sand" : "bg-white"}
                >
                  <td className="px-6 py-3 text-sm text-charcoal font-medium">
                    {student.name}
                  </td>
                  <td className="px-6 py-3 text-sm text-charcoal">
                    {student.slot || "\u2014"}
                  </td>
                  <td className="px-6 py-3 text-sm text-charcoal">
                    {student.week ? `Week ${student.week}` : "\u2014"}
                  </td>
                  <td className="px-6 py-3 text-sm text-charcoal">
                    {student.group || "\u2014"}
                  </td>
                  <td className="px-6 py-3 text-sm text-warm-grey">
                    {new Date(student.enrolledAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/slots"
          className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
        >
          <Plus size={16} /> Add Slot
        </Link>
        <Link
          href="/admin/students"
          className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
        >
          <UserPlus size={16} /> Add Student
        </Link>
        <button
          onClick={() => (window.location.href = "/api/admin/csv")}
          className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-lg border border-sand-dark shadow-sm p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-warm-grey">{icon}</div>
        <span className="text-sm font-medium text-warm-grey">{label}</span>
      </div>
      <div className="text-3xl font-semibold text-navy">{value}</div>
    </div>
  );
}
