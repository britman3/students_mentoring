"use client";

import { useEffect, useState } from "react";
import { Download, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/loading-skeleton";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  slotInstance: {
    groupLabel: string;
    weekNumber: number;
    slot: { day: string; time: string };
  } | null;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/students")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    LINK_SENT: "bg-blue-100 text-blue-800",
    SLOT_SELECTED: "bg-amber-100 text-amber-800",
    ACTIVE: "bg-green-100 text-green-800",
    PAUSED: "bg-stone text-warmGrey-dark",
    DROPPED: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">Students</h1>
          <p className="text-warmGrey text-sm mt-1">
            {students.length} student{students.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <a
          href="/api/admin/csv"
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-navy text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-navy-light transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </a>
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : students.length === 0 ? (
        <EmptyState
          icon="students"
          title="No students yet"
          description="Students will appear here once they enrol through a magic link."
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sand border-b border-stone">
                  <th className="text-left px-4 py-3 font-medium text-warmGrey">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-warmGrey">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-warmGrey">Slot</th>
                  <th className="text-left px-4 py-3 font-medium text-warmGrey">Week</th>
                  <th className="text-left px-4 py-3 font-medium text-warmGrey">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-sand last:border-0 hover:bg-sand-light">
                    <td className="px-4 py-3 font-medium text-navy">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-4 py-3 text-warmGrey">{student.email}</td>
                    <td className="px-4 py-3 text-warmGrey">
                      {student.slotInstance
                        ? `${student.slotInstance.slot.day} ${student.slotInstance.slot.time}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-warmGrey">
                      {student.slotInstance ? student.slotInstance.weekNumber : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          statusColors[student.status] ?? "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {student.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {students.map((student) => (
              <div key={student.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-navy">
                    {student.firstName} {student.lastName}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      statusColors[student.status] ?? "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {student.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-warmGrey">{student.email}</p>
                {student.slotInstance && (
                  <p className="text-sm text-warmGrey mt-1">
                    {student.slotInstance.slot.day} {student.slotInstance.slot.time} — Week{" "}
                    {student.slotInstance.weekNumber}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
