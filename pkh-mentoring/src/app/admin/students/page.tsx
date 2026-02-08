"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Save,
  ArrowUpCircle,
  Plus,
  Download,
  Copy,
  Check,
  Mail,
  X,
} from "lucide-react";

interface StudentSlot {
  id: string;
  displayName: string;
  dayName: string;
  time: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  notes: string | null;
  joinCode: string | null;
  studentNumber: string | null;
  firstCallDate: string | null;
  createdAt: string;
  slot: StudentSlot | null;
  week: number | null;
  group: string | null;
  slotInstanceId: string | null;
  attendedCount: number;
  closerName: string | null;
  closerId: string | null;
}

interface SlotOption {
  id: string;
  displayName: string;
  instances: {
    id: string;
    weekNumber: number;
    groupCode: string;
    capacity: number;
    studentCount: number;
  }[];
}

interface CloserOption {
  id: string;
  firstName: string;
}

interface AttendanceDetail {
  id: string;
  accessedAt: string;
}

const STATUSES = ["SLOT_SELECTED", "ACTIVE", "PAUSED", "CANCELLED"];
const BULK_STATUSES = ["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"];

function getLastCallDate(firstCallDate: string | null): Date | null {
  if (!firstCallDate) return null;
  const d = new Date(firstCallDate);
  const plusSixMonths = new Date(d);
  plusSixMonths.setMonth(plusSixMonths.getMonth() + 6);
  const plusTwoWeeks = new Date(plusSixMonths);
  plusTwoWeeks.setDate(plusTwoWeeks.getDate() + 14);
  return plusTwoWeeks;
}

function formatDateUK(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function getDaysLeft(firstCallDate: string | null): string {
  if (!firstCallDate) return "\u2014";
  const lastCall = getLastCallDate(firstCallDate);
  if (!lastCall) return "\u2014";
  const now = new Date();
  const diff = Math.ceil(
    (lastCall.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff < 0) return "Completed";
  return String(diff);
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [closers, setClosers] = useState<CloserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSlot, setFilterSlot] = useState("");
  const [filterWeek, setFilterWeek] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCloser, setFilterCloser] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchStudents = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterSlot) params.set("slotId", filterSlot);
    if (filterWeek) params.set("week", filterWeek);
    if (filterStatus) params.set("status", filterStatus);
    if (filterCloser) params.set("closerId", filterCloser);

    fetch(`/api/admin/students?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setStudents(data);
        setSelectedIds(new Set());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, filterSlot, filterWeek, filterStatus, filterCloser]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetch("/api/admin/slots")
      .then((res) => res.json())
      .then(setSlots)
      .catch(console.error);
    fetch("/api/admin/stats/summary")
      .then((res) => res.json())
      .then((data) => {
        if (data.closerStats) {
          setClosers(
            data.closerStats.map(
              (c: { id: string; firstName: string }) => ({
                id: c.id,
                firstName: c.firstName,
              })
            )
          );
        }
      })
      .catch(console.error);
  }, []);

  function showToastMsg(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map((s) => s.id)));
    }
  }

  async function applyBulkStatus() {
    if (!bulkStatus || selectedIds.size === 0) return;
    try {
      const res = await fetch("/api/admin/students/bulk-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: Array.from(selectedIds),
          status: bulkStatus,
        }),
      });
      if (res.ok) {
        showToastMsg(
          `Updated ${selectedIds.size} student(s) to ${bulkStatus}`
        );
        fetchStudents();
        setBulkStatus("");
      }
    } catch (err) {
      console.error(err);
    }
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      SLOT_SELECTED: "bg-info/10 text-info",
      ACTIVE: "bg-success/10 text-success",
      PAUSED: "bg-warning/10 text-warning",
      CANCELLED: "bg-error/10 text-error",
      PROSPECT: "bg-sand-dark text-charcoal",
      ENROLLED: "bg-navy/10 text-navy",
      COMPLETED: "bg-success/10 text-success",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-sand-dark text-charcoal"}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  }

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-success text-white px-4 py-2 rounded-md shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-navy">
          Student Management
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => (window.location.href = "/api/admin/csv")}
            className="flex items-center gap-2 border border-navy text-navy hover:bg-navy hover:text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
          >
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-grey"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-navy/20 rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm"
          />
        </div>
        <select
          value={filterSlot}
          onChange={(e) => setFilterSlot(e.target.value)}
          className="px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm"
        >
          <option value="">All Slots</option>
          {slots.map((s) => (
            <option key={s.id} value={s.id}>
              {s.displayName}
            </option>
          ))}
        </select>
        <select
          value={filterWeek}
          onChange={(e) => setFilterWeek(e.target.value)}
          className="px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm"
        >
          <option value="">All Weeks</option>
          <option value="1">Week 1</option>
          <option value="2">Week 2</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
        <select
          value={filterCloser}
          onChange={(e) => setFilterCloser(e.target.value)}
          className="px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm"
        >
          <option value="">All Closers</option>
          {closers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName}
            </option>
          ))}
        </select>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="bg-navy text-white px-4 py-3 rounded-md mb-4 flex items-center gap-4 text-sm">
          <span className="font-medium">
            {selectedIds.size} student{selectedIds.size > 1 ? "s" : ""}{" "}
            selected
          </span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="px-3 py-1 rounded-md bg-navy-light text-white border border-white/20 text-sm"
          >
            <option value="">Change status...</option>
            {BULK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          <button
            onClick={applyBulkStatus}
            disabled={!bulkStatus}
            className="px-4 py-1 bg-gold text-navy font-medium rounded-md disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-sand-dark shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sand-dark bg-sand">
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={
                      students.length > 0 &&
                      selectedIds.size === students.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-sand-dark"
                  />
                </th>
                <th className="w-8 px-2 py-3" />
                <th className="text-left px-4 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Slot
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Week
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Group
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  First Call
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Last Call
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Days Left
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Attended
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Closer
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={14}
                    className="px-6 py-8 text-center text-warm-grey"
                  >
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && students.length === 0 && (
                <tr>
                  <td
                    colSpan={14}
                    className="px-6 py-8 text-center text-warm-grey"
                  >
                    No students found
                  </td>
                </tr>
              )}
              {students.map((student, i) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  index={i}
                  expanded={expandedId === student.id}
                  onToggle={() =>
                    setExpandedId(
                      expandedId === student.id ? null : student.id
                    )
                  }
                  slots={slots}
                  statusBadge={getStatusBadge(student.status)}
                  onUpdated={fetchStudents}
                  selected={selectedIds.has(student.id)}
                  onSelect={() => toggleSelect(student.id)}
                  showToast={showToastMsg}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <AddStudentModal
          slots={slots}
          closers={closers}
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            fetchStudents();
            showToastMsg("Student added successfully");
          }}
        />
      )}
    </div>
  );
}

function StudentRow({
  student,
  index,
  expanded,
  onToggle,
  slots,
  statusBadge,
  onUpdated,
  selected,
  onSelect,
  showToast,
}: {
  student: Student;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  slots: SlotOption[];
  statusBadge: React.ReactNode;
  onUpdated: () => void;
  selected: boolean;
  onSelect: () => void;
  showToast: (msg: string) => void;
}) {
  const [notes, setNotes] = useState(student.notes || "");
  const [reassignInstance, setReassignInstance] = useState("");
  const [saving, setSaving] = useState(false);
  const [attendances, setAttendances] = useState<AttendanceDetail[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [hasWaitlist, setHasWaitlist] = useState(false);
  const [copiedJoin, setCopiedJoin] = useState(false);

  useEffect(() => {
    if (expanded) {
      setLoadingDetail(true);
      fetch(`/api/admin/students/${student.id}`)
        .then((res) => res.json())
        .then((data) => {
          setAttendances(data.attendances || []);
          setHasWaitlist(data.hasWaitlistEntry || false);
          if (data.notes !== undefined) setNotes(data.notes || "");
        })
        .catch(console.error)
        .finally(() => setLoadingDetail(false));
    }
  }, [expanded, student.id]);

  async function saveNotes() {
    setSaving(true);
    try {
      await fetch(`/api/admin/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      showToast("Notes saved");
      onUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function reassign() {
    if (!reassignInstance) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotInstanceId: reassignInstance }),
      });
      showToast("Slot reassigned");
      onUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function promote() {
    setSaving(true);
    try {
      await fetch(`/api/admin/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promote: true }),
      });
      showToast("Student promoted from waitlist");
      onUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function resendEmail() {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/students/${student.id}/resend-email`,
        { method: "POST" }
      );
      if (res.ok) {
        showToast("Confirmation email resent");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to send email");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function copyJoinLink() {
    if (!student.joinCode) return;
    const appUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3099";
    navigator.clipboard.writeText(`${appUrl}/join/${student.joinCode}`);
    setCopiedJoin(true);
    setTimeout(() => setCopiedJoin(false), 2000);
  }

  const lastCallDate = getLastCallDate(student.firstCallDate);
  const lastCallStr = lastCallDate
    ? lastCallDate.toLocaleDateString("en-GB")
    : "\u2014";
  const daysLeft = getDaysLeft(student.firstCallDate);

  return (
    <>
      <tr
        className={`cursor-pointer ${index % 2 === 1 ? "bg-sand" : "bg-white"} hover:bg-sand/70`}
        onClick={onToggle}
      >
        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="rounded border-sand-dark"
          />
        </td>
        <td className="px-2 py-3 text-warm-grey">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </td>
        <td className="px-4 py-3 text-sm font-medium text-charcoal whitespace-nowrap">
          {student.name}
        </td>
        <td className="px-4 py-3 text-sm text-charcoal">{student.email}</td>
        <td className="px-4 py-3 text-sm text-charcoal whitespace-nowrap">
          {student.phone || "\u2014"}
        </td>
        <td className="px-4 py-3 text-sm text-charcoal whitespace-nowrap">
          {student.slot ? student.slot.displayName : "\u2014"}
        </td>
        <td className="px-4 py-3 text-sm text-charcoal">
          {student.week ? `Week ${student.week}` : "\u2014"}
        </td>
        <td className="px-4 py-3 text-sm text-charcoal">
          {student.group || "\u2014"}
        </td>
        <td className="px-4 py-3 text-sm text-charcoal whitespace-nowrap">
          {formatDateUK(student.firstCallDate)}
        </td>
        <td className="px-4 py-3 text-sm text-charcoal whitespace-nowrap">
          {lastCallStr}
        </td>
        <td className="px-4 py-3 text-sm text-charcoal">
          <span
            className={
              daysLeft === "Completed" ? "text-success font-medium" : ""
            }
          >
            {daysLeft}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-charcoal">
          {student.attendedCount}
        </td>
        <td className="px-4 py-3 text-sm text-charcoal whitespace-nowrap">
          {student.closerName || "\u2014"}
        </td>
        <td className="px-4 py-3">{statusBadge}</td>
      </tr>
      {expanded && (
        <tr className="bg-sand/50">
          <td colSpan={14} className="px-6 py-4">
            {loadingDetail ? (
              <div className="text-warm-grey text-sm">
                Loading details...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Details + Attendance */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-navy mb-2">
                      Details
                    </h3>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-warm-grey">
                          Student Number:
                        </span>{" "}
                        {student.studentNumber || "Pending"}
                      </p>
                      <p>
                        <span className="text-warm-grey">Status:</span>{" "}
                        {student.status.replace("_", " ")}
                      </p>
                      <p>
                        <span className="text-warm-grey">Created:</span>{" "}
                        {formatDateUK(student.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-navy mb-2">
                      Attendance History
                    </h3>
                    <p className="text-sm text-charcoal">
                      {attendances.length} session
                      {attendances.length !== 1 ? "s" : ""}
                      {attendances.length > 0 && (
                        <span className="text-warm-grey">
                          {" \u2014 "}
                          {attendances
                            .map((a) => {
                              const d = new Date(a.accessedAt);
                              return `${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "short" })}`;
                            })
                            .join(", ")}
                        </span>
                      )}
                    </p>
                  </div>
                  {student.joinCode && (
                    <div>
                      <h3 className="text-sm font-semibold text-navy mb-2">
                        Join Link
                      </h3>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-sand px-2 py-1 rounded break-all">
                          /join/{student.joinCode}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyJoinLink();
                          }}
                          className="text-warm-grey hover:text-navy flex-shrink-0"
                          title="Copy join link"
                        >
                          {copiedJoin ? (
                            <Check
                              size={14}
                              className="text-success"
                            />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 2: Notes + Resend Email */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      rows={3}
                      className="w-full px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold text-sm"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveNotes();
                      }}
                      disabled={saving}
                      className="mt-1 flex items-center gap-1 text-sm text-navy hover:text-navy-light font-medium"
                    >
                      <Save size={14} /> Save Notes
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resendEmail();
                    }}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-navy text-navy hover:bg-navy hover:text-white rounded-md transition-colors"
                  >
                    <Mail size={14} /> Resend Confirmation Email
                  </button>
                </div>

                {/* Column 3: Reassign + Promote */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-1">
                      Reassign Slot
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={reassignInstance}
                        onChange={(e) =>
                          setReassignInstance(e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold text-sm bg-white"
                      >
                        <option value="">Select slot...</option>
                        {slots.flatMap((s) =>
                          s.instances.map((inst) => (
                            <option key={inst.id} value={inst.id}>
                              {s.displayName} - Week{" "}
                              {inst.weekNumber} ({inst.groupCode}) [
                              {inst.studentCount}/{inst.capacity}]
                            </option>
                          ))
                        )}
                      </select>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          reassign();
                        }}
                        disabled={!reassignInstance || saving}
                        className="px-3 py-2 text-sm font-medium bg-navy hover:bg-navy-light text-white rounded-md disabled:opacity-50"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                  {hasWaitlist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        promote();
                      }}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-success hover:bg-success/90 text-white rounded-md"
                    >
                      <ArrowUpCircle size={16} /> Promote from
                      Waitlist
                    </button>
                  )}
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function AddStudentModal({
  slots,
  closers,
  onClose,
  onCreated,
}: {
  slots: SlotOption[];
  closers: CloserOption[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [slotId, setSlotId] = useState("");
  const [closerId, setCloserId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          slotId,
          closerId: closerId || undefined,
        }),
      });
      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add student");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand-dark">
          <h2 className="text-lg font-semibold text-navy">Add Student</h2>
          <button
            onClick={onClose}
            className="text-warm-grey hover:text-navy"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Phone *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Slot *
            </label>
            <select
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm"
            >
              <option value="">Select a slot...</option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.displayName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Closer
            </label>
            <select
              value={closerId}
              onChange={(e) => setCloserId(e.target.value)}
              className="w-full px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm"
            >
              <option value="">None</option>
              {closers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-md text-error text-sm">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-charcoal hover:bg-sand rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-navy hover:bg-navy-light text-white rounded-md transition-colors disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
