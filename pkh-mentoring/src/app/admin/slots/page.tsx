"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Copy, X, Check } from "lucide-react";

interface SlotInstance {
  id: string;
  weekNumber: number;
  groupCode: string;
  capacity: number;
  studentCount: number;
}

interface Slot {
  id: string;
  dayOfWeek: number;
  dayName: string;
  time: string;
  displayTime: string;
  displayName: string;
  zoomLink: string | null;
  isOpen: boolean;
  instances: SlotInstance[];
  totalStudents: number;
  totalCapacity: number;
}

const DAYS = [
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
];

const TIMES = [
  { value: "12:00", label: "12pm (12:00)" },
  { value: "14:00", label: "2pm (14:00)" },
  { value: "16:00", label: "4pm (16:00)" },
  { value: "18:00", label: "6pm (18:00)" },
];

export default function SlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editSlot, setEditSlot] = useState<Slot | null>(null);
  const [copiedZoom, setCopiedZoom] = useState<string | null>(null);

  const fetchSlots = useCallback(() => {
    fetch("/api/admin/slots")
      .then((res) => res.json())
      .then(setSlots)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  function copyZoomLink(link: string, slotId: string) {
    navigator.clipboard.writeText(link);
    setCopiedZoom(slotId);
    setTimeout(() => setCopiedZoom(null), 2000);
  }

  function getCapacityColor(count: number, capacity: number) {
    if (capacity === 0) return "bg-sand-dark";
    const pct = (count / capacity) * 100;
    if (pct > 90) return "bg-error";
    if (pct > 70) return "bg-warning";
    return "bg-success";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-warm-grey">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-navy">Slot Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
        >
          <Plus size={16} /> Add Slot
        </button>
      </div>

      <div className="bg-white rounded-lg border border-sand-dark shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sand-dark bg-sand">
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Display Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Zoom Link
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Week 1
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Week 2
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Capacity
                </th>
              </tr>
            </thead>
            <tbody>
              {slots.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-warm-grey"
                  >
                    No slots yet. Click &quot;Add Slot&quot; to create one.
                  </td>
                </tr>
              )}
              {slots.map((slot, i) => {
                const w1 = slot.instances.find(
                  (inst) => inst.weekNumber === 1
                );
                const w2 = slot.instances.find(
                  (inst) => inst.weekNumber === 2
                );
                return (
                  <tr
                    key={slot.id}
                    className={`cursor-pointer ${i % 2 === 1 ? "bg-sand" : "bg-white"} hover:bg-sand/70`}
                    onClick={() => setEditSlot(slot)}
                  >
                    <td className="px-6 py-3 text-sm font-medium text-charcoal">
                      {slot.displayName}
                    </td>
                    <td className="px-6 py-3 text-sm text-charcoal">
                      {slot.zoomLink ? (
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[120px]">
                            {slot.zoomLink}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyZoomLink(slot.zoomLink!, slot.id);
                            }}
                            className="text-warm-grey hover:text-navy flex-shrink-0"
                            title="Copy zoom link"
                          >
                            {copiedZoom === slot.id ? (
                              <Check size={14} className="text-success" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-warm-grey">{"\u2014"}</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${slot.isOpen ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}
                      >
                        {slot.isOpen ? "Open" : "Closed"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-charcoal">
                      {w1 ? (
                        <span>
                          {w1.groupCode}: {w1.studentCount}/{w1.capacity}
                        </span>
                      ) : (
                        "\u2014"
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-charcoal">
                      {w2 ? (
                        <span>
                          {w2.groupCode}: {w2.studentCount}/{w2.capacity}
                        </span>
                      ) : (
                        "\u2014"
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-navy">
                      {slot.totalStudents}
                    </td>
                    <td className="px-6 py-3">
                      <div className="w-24">
                        <div className="h-2 bg-sand-dark/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getCapacityColor(slot.totalStudents, slot.totalCapacity)}`}
                            style={{
                              width: `${slot.totalCapacity > 0 ? Math.min((slot.totalStudents / slot.totalCapacity) * 100, 100) : 0}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-warm-grey mt-1">
                          {slot.totalStudents}/{slot.totalCapacity}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <AddSlotModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            fetchSlots();
          }}
        />
      )}
      {editSlot && (
        <EditSlotModal
          slot={editSlot}
          onClose={() => setEditSlot(null)}
          onUpdated={() => {
            setEditSlot(null);
            fetchSlots();
          }}
        />
      )}
    </div>
  );
}

function AddSlotModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [dayOfWeek, setDayOfWeek] = useState("2");
  const [time, setTime] = useState("12:00");
  const [zoomLink, setZoomLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: parseInt(dayOfWeek, 10),
          time,
          zoomLink,
        }),
      });
      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create slot");
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
          <h2 className="text-lg font-semibold text-navy">Add Slot</h2>
          <button onClick={onClose} className="text-warm-grey hover:text-navy">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Day
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white"
            >
              {DAYS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Time
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white"
            >
              {TIMES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Zoom Link
            </label>
            <input
              type="url"
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              placeholder="https://zoom.us/j/..."
              className="w-full px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
            />
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
              {saving ? "Creating..." : "Create Slot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditSlotModal({
  slot,
  onClose,
  onUpdated,
}: {
  slot: Slot;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [zoomLink, setZoomLink] = useState(slot.zoomLink || "");
  const [isOpen, setIsOpen] = useState(slot.isOpen);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/slots/${slot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoomLink, isOpen }),
      });
      if (res.ok) {
        onUpdated();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update slot");
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
          <h2 className="text-lg font-semibold text-navy">
            Edit: {slot.displayName}
          </h2>
          <button onClick={onClose} className="text-warm-grey hover:text-navy">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Zoom Link
            </label>
            <input
              type="url"
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              placeholder="https://zoom.us/j/..."
              className="w-full px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-charcoal">Status</label>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOpen ? "bg-success" : "bg-sand-dark"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOpen ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
            <span className="text-sm text-charcoal">
              {isOpen ? "Open" : "Closed"}
            </span>
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
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
