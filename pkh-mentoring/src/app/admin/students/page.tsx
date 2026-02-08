"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronDown, ChevronUp, Save, ArrowUpCircle } from "lucide-react";

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
  phone: string | null;
  status: string;
  notes: string | null;
  firstCallDate: string | null;
  createdAt: string;
  slot: StudentSlot | null;
  week: number | null;
  group: string | null;
  slotInstanceId: string | null;
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

const STATUSES = ["SLOT_SELECTED", "ACTIVE", "PAUSED", "CANCELLED"];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSlot, setFilterSlot] = useState("");
  const [filterWeek, setFilterWeek] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchStudents = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterSlot) params.set("slotId", filterSlot);
    if (filterWeek) params.set("week", filterWeek);
    if (filterStatus) params.set("status", filterStatus);

    fetch(`/api/admin/students?${params}`)
      .then((res) => res.json())
      .then(setStudents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, filterSlot, filterWeek, filterStatus]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => {
    fetch("/api/admin/slots").then((res) => res.json()).then(setSlots).catch(console.error);
  }, []);

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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-sand-dark text-charcoal"}`}>
        {status.replace("_", " ")}
      </span>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy mb-6">Student Management</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-grey" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-navy/20 rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm" />
        </div>
        <select value={filterSlot} onChange={(e) => setFilterSlot(e.target.value)} className="px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm">
          <option value="">All Slots</option>
          {slots.map((s) => <option key={s.id} value={s.id}>{s.displayName}</option>)}
        </select>
        <select value={filterWeek} onChange={(e) => setFilterWeek(e.target.value)} className="px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm">
          <option value="">All Weeks</option>
          <option value="1">Week 1</option>
          <option value="2">Week 2</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-sand-dark shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sand-dark bg-sand">
                <th className="w-8 px-3 py-3" />
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Phone</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Slot</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Week</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Group</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">First Call</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9} className="px-6 py-8 text-center text-warm-grey">Loading...</td></tr>}
              {!loading && students.length === 0 && <tr><td colSpan={9} className="px-6 py-8 text-center text-warm-grey">No students found</td></tr>}
              {students.map((student, i) => (
                <StudentRow key={student.id} student={student} index={i} expanded={expandedId === student.id}
                  onToggle={() => setExpandedId(expandedId === student.id ? null : student.id)}
                  slots={slots} statusBadge={getStatusBadge(student.status)} onUpdated={fetchStudents} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentRow({ student, index, expanded, onToggle, slots, statusBadge, onUpdated }: {
  student: Student; index: number; expanded: boolean; onToggle: () => void;
  slots: SlotOption[]; statusBadge: React.ReactNode; onUpdated: () => void;
}) {
  const [notes, setNotes] = useState(student.notes || "");
  const [reassignInstance, setReassignInstance] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveNotes() {
    setSaving(true);
    try { await fetch(`/api/admin/students/${student.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes }) }); onUpdated(); }
    catch (err) { console.error(err); } finally { setSaving(false); }
  }

  async function reassign() {
    if (!reassignInstance) return;
    setSaving(true);
    try { await fetch(`/api/admin/students/${student.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slotInstanceId: reassignInstance }) }); onUpdated(); }
    catch (err) { console.error(err); } finally { setSaving(false); }
  }

  async function promote() {
    setSaving(true);
    try { await fetch(`/api/admin/students/${student.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ promote: true }) }); onUpdated(); }
    catch (err) { console.error(err); } finally { setSaving(false); }
  }

  return (
    <>
      <tr className={`cursor-pointer ${index % 2 === 1 ? "bg-sand" : "bg-white"} hover:bg-sand/70`} onClick={onToggle}>
        <td className="px-3 py-3 text-warm-grey">{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</td>
        <td className="px-6 py-3 text-sm font-medium text-charcoal">{student.name}</td>
        <td className="px-6 py-3 text-sm text-charcoal">{student.email}</td>
        <td className="px-6 py-3 text-sm text-charcoal">{student.phone || "—"}</td>
        <td className="px-6 py-3 text-sm text-charcoal">{student.slot ? student.slot.displayName : "—"}</td>
        <td className="px-6 py-3 text-sm text-charcoal">{student.week ? `Week ${student.week}` : "—"}</td>
        <td className="px-6 py-3 text-sm text-charcoal">{student.group || "—"}</td>
        <td className="px-6 py-3 text-sm text-charcoal">{student.firstCallDate ? new Date(student.firstCallDate).toLocaleDateString() : "—"}</td>
        <td className="px-6 py-3">{statusBadge}</td>
      </tr>
      {expanded && (
        <tr className="bg-sand/50">
          <td colSpan={9} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-navy">Details</h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-warm-grey">Email:</span> {student.email}</p>
                  {student.phone && <p><span className="text-warm-grey">Phone:</span> {student.phone}</p>}
                  <p><span className="text-warm-grey">Status:</span> {student.status.replace("_", " ")}</p>
                  <p><span className="text-warm-grey">Created:</span> {new Date(student.createdAt).toLocaleDateString()}</p>

                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onClick={(e) => e.stopPropagation()} rows={3}
                    className="w-full px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold text-sm" />
                  <button onClick={(e) => { e.stopPropagation(); saveNotes(); }} disabled={saving}
                    className="mt-1 flex items-center gap-1 text-sm text-navy hover:text-navy-light font-medium">
                    <Save size={14} /> Save Notes
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1">Reassign Slot</label>
                  <div className="flex gap-2">
                    <select value={reassignInstance} onChange={(e) => setReassignInstance(e.target.value)} onClick={(e) => e.stopPropagation()}
                      className="flex-1 px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold text-sm bg-white">
                      <option value="">Select slot...</option>
                      {slots.flatMap((s) => s.instances.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {s.displayName} - Week {inst.weekNumber} (Group {inst.groupCode}) [{inst.studentCount}/{inst.capacity}]
                        </option>
                      )))}
                    </select>
                    <button onClick={(e) => { e.stopPropagation(); reassign(); }} disabled={!reassignInstance || saving}
                      className="px-3 py-2 text-sm font-medium bg-navy hover:bg-navy-light text-white rounded-md disabled:opacity-50">Confirm</button>
                  </div>
                </div>
                {student.status === "PROSPECT" && (
                  <button onClick={(e) => { e.stopPropagation(); promote(); }} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-success hover:bg-success/90 text-white rounded-md">
                    <ArrowUpCircle size={16} /> Promote from Waitlist
                  </button>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
