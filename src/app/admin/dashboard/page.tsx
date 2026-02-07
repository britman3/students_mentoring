import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import Link from "next/link";
import { Users, BarChart3, Settings, Download, Clock, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "PKH Mentoring — Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totalStudents, activeStudents, totalSlots, waitlistCount] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { status: { in: ["SLOT_SELECTED", "ACTIVE"] } } }),
    prisma.slotInstance.count(),
    prisma.waitlistEntry.count({ where: { status: "WAITING" } }),
  ]);

  const settings = await prisma.settings.findFirst({ where: { id: "global" } });
  const totalCapacity = (settings?.globalCapacity ?? 4) * totalSlots;

  const stats = [
    { label: "Total Students", value: totalStudents, icon: Users },
    { label: "Active / Enrolled", value: activeStudents, icon: UserCheck },
    { label: "Total Capacity", value: totalCapacity, icon: BarChart3 },
    { label: "Waitlisted", value: waitlistCount, icon: Clock },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
          <p className="text-warmGrey text-sm mt-1">Overview of your mentoring programme</p>
        </div>
        <a
          href="/api/admin/csv"
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-navy text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-navy-light transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-warmGrey uppercase tracking-wide">
                  {stat.label}
                </span>
                <Icon className="w-4 h-4 text-stone" />
              </div>
              <p className="text-2xl font-bold text-navy">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <h2 className="text-lg font-semibold text-navy mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/students"
          className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow group"
        >
          <Users className="w-6 h-6 text-gold mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-navy">Manage Students</h3>
          <p className="text-sm text-warmGrey mt-1">View, edit, and manage enrolled students</p>
        </Link>
        <Link
          href="/admin/stats"
          className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow group"
        >
          <BarChart3 className="w-6 h-6 text-gold mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-navy">View Statistics</h3>
          <p className="text-sm text-warmGrey mt-1">Slot utilisation, capacity, and trends</p>
        </Link>
        <Link
          href="/admin/settings"
          className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow group"
        >
          <Settings className="w-6 h-6 text-gold mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-navy">Settings</h3>
          <p className="text-sm text-warmGrey mt-1">Capacity, dates, and display options</p>
        </Link>
      </div>
    </div>
  );
}
