"use client";

import { useEffect, useState } from "react";
import { BarChart3, Users, Percent, Clock } from "lucide-react";
import { CapacityBar } from "@/components/ui/capacity-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSkeleton } from "@/components/ui/loading-skeleton";

interface PerSlot {
  slotName: string;
  groupLabelWeek1: string;
  groupLabelWeek2: string;
  week1Count: number;
  week2Count: number;
  total: number;
  capacity: number;
  utilisation: number;
}

interface WaitlistCount {
  slotName: string;
  count: number;
}

interface StatsData {
  totalStudents: number;
  totalCapacity: number;
  overallUtilisation: number;
  perSlot: PerSlot[];
  waitlistCounts: WaitlistCount[];
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;

  if (!data) {
    return (
      <EmptyState
        icon="stats"
        title="Unable to load statistics"
        description="Please try refreshing the page."
      />
    );
  }

  const overviewCards = [
    {
      label: "Total Enrolled",
      value: data.totalStudents,
      icon: Users,
    },
    {
      label: "Total Capacity",
      value: data.totalCapacity,
      icon: BarChart3,
    },
    {
      label: "Overall Utilisation",
      value: `${data.overallUtilisation}%`,
      icon: Percent,
    },
  ];

  const totalWaitlist = data.waitlistCounts.reduce((s, w) => s + w.count, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Statistics</h1>
      <p className="text-warmGrey text-sm mb-8">Programme capacity and enrolment overview</p>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-warmGrey uppercase tracking-wide">
                  {card.label}
                </span>
                <Icon className="w-4 h-4 text-stone" />
              </div>
              <p className="text-2xl font-bold text-navy">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Per-slot breakdown */}
      <h2 className="text-lg font-semibold text-navy mb-4">Per-Slot Breakdown</h2>

      {data.perSlot.length === 0 ? (
        <EmptyState
          icon="slots"
          title="No slots configured"
          description="Create slots to see per-slot statistics."
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sand border-b border-stone">
                  <th className="text-left px-4 py-3 font-medium text-warmGrey">Slot</th>
                  <th className="text-left px-4 py-3 font-medium text-warmGrey">Week 1 Group</th>
                  <th className="text-left px-4 py-3 font-medium text-warmGrey">Week 2 Group</th>
                  <th className="text-center px-4 py-3 font-medium text-warmGrey">Wk 1</th>
                  <th className="text-center px-4 py-3 font-medium text-warmGrey">Wk 2</th>
                  <th className="text-center px-4 py-3 font-medium text-warmGrey">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-warmGrey">Capacity</th>
                </tr>
              </thead>
              <tbody>
                {data.perSlot.map((slot) => (
                  <tr key={slot.slotName} className="border-b border-sand last:border-0">
                    <td className="px-4 py-3 font-medium text-navy">{slot.slotName}</td>
                    <td className="px-4 py-3 text-warmGrey text-xs">{slot.groupLabelWeek1}</td>
                    <td className="px-4 py-3 text-warmGrey text-xs">{slot.groupLabelWeek2}</td>
                    <td className="px-4 py-3 text-center text-warmGrey">{slot.week1Count}</td>
                    <td className="px-4 py-3 text-center text-warmGrey">{slot.week2Count}</td>
                    <td className="px-4 py-3 text-center font-medium text-navy">{slot.total}</td>
                    <td className="px-4 py-3">
                      <CapacityBar current={slot.total} capacity={slot.capacity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3 mb-8">
            {data.perSlot.map((slot) => (
              <div key={slot.slotName} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-navy">{slot.slotName}</span>
                  <span className="text-xs text-warmGrey">{slot.utilisation}% full</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div>
                    <p className="text-xs text-warmGrey">Wk 1</p>
                    <p className="font-medium text-navy">{slot.week1Count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-warmGrey">Wk 2</p>
                    <p className="font-medium text-navy">{slot.week2Count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-warmGrey">Total</p>
                    <p className="font-medium text-navy">{slot.total}</p>
                  </div>
                </div>
                <CapacityBar current={slot.total} capacity={slot.capacity} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Waitlist section */}
      <h2 className="text-lg font-semibold text-navy mb-4">
        Waitlist Summary
        {totalWaitlist > 0 && (
          <span className="ml-2 text-sm font-normal text-warmGrey">
            ({totalWaitlist} total)
          </span>
        )}
      </h2>

      {totalWaitlist === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <Clock className="w-8 h-8 text-stone mx-auto mb-2" />
          <p className="text-sm text-warmGrey">No students on the waitlist</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sand border-b border-stone">
                <th className="text-left px-4 py-3 font-medium text-warmGrey">Slot</th>
                <th className="text-center px-4 py-3 font-medium text-warmGrey">Waiting</th>
              </tr>
            </thead>
            <tbody>
              {data.waitlistCounts
                .filter((w) => w.count > 0)
                .map((w) => (
                  <tr key={w.slotName} className="border-b border-sand last:border-0">
                    <td className="px-4 py-3 font-medium text-navy">{w.slotName}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-medium">
                        {w.count}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
