"use client";

import { useEffect, useState, useCallback } from "react";
import { Copy, Check, AlertTriangle, Pencil, X, Save } from "lucide-react";

interface SlotInstance {
  id: string;
  weekNumber: number;
  groupCode: string;
}

interface Slot {
  id: string;
  displayName: string;
  zoomLink: string | null;
  isOpen: boolean;
  instances: SlotInstance[];
}

export default function ZoomPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function copyLink(link: string, slotId: string) {
    navigator.clipboard.writeText(link);
    setCopiedId(slotId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function startEdit(slot: Slot) {
    setEditingId(slot.id);
    setEditValue(slot.zoomLink || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  async function saveZoomLink(slotId: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/slots/${slotId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoomLink: editValue }),
      });
      if (res.ok) {
        showToast("Zoom link updated");
        fetchSlots();
        setEditingId(null);
        setEditValue("");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update");
      }
    } catch {
      showToast("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-warm-grey">Loading...</div>
      </div>
    );
  }

  const missingCount = slots.filter((s) => !s.zoomLink && s.isOpen).length;

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-success text-white px-4 py-2 rounded-md shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-navy">Zoom Links</h1>
        {missingCount > 0 && (
          <div className="flex items-center gap-2 text-warning text-sm font-medium">
            <AlertTriangle size={16} />
            {missingCount} open slot{missingCount > 1 ? "s" : ""} missing Zoom link
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-sand-dark shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sand-dark bg-sand">
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Slot
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Groups
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">
                  Zoom Link
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {slots.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-warm-grey">
                    No slots configured yet.
                  </td>
                </tr>
              )}
              {slots.map((slot, i) => {
                const w1 = slot.instances.find((inst) => inst.weekNumber === 1);
                const w2 = slot.instances.find((inst) => inst.weekNumber === 2);
                const groupCodes = [w1?.groupCode, w2?.groupCode].filter(Boolean).join(" / ");
                const isEditing = editingId === slot.id;
                const hasMissingLink = !slot.zoomLink && slot.isOpen;

                return (
                  <tr
                    key={slot.id}
                    className={`${i % 2 === 1 ? "bg-sand" : "bg-white"} ${hasMissingLink ? "border-l-4 border-l-warning" : ""}`}
                  >
                    <td className="px-6 py-3 text-sm font-medium text-charcoal">
                      {slot.displayName}
                    </td>
                    <td className="px-6 py-3 text-sm text-charcoal font-mono">
                      {groupCodes || "\u2014"}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          slot.isOpen ? "bg-success/10 text-success" : "bg-error/10 text-error"
                        }`}
                      >
                        {slot.isOpen ? "Open" : "Closed"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="url"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="https://zoom.us/j/..."
                          className="w-full px-3 py-1.5 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold text-sm"
                          autoFocus
                        />
                      ) : slot.zoomLink ? (
                        <span className="text-charcoal truncate block max-w-[300px]" title={slot.zoomLink}>
                          {slot.zoomLink}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-warning">
                          <AlertTriangle size={14} />
                          No link set
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveZoomLink(slot.id)}
                              disabled={saving}
                              className="text-success hover:text-success/80 disabled:opacity-50"
                              title="Save"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-warm-grey hover:text-navy"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(slot)}
                              className="text-warm-grey hover:text-navy"
                              title="Edit Zoom link"
                            >
                              <Pencil size={16} />
                            </button>
                            {slot.zoomLink && (
                              <button
                                onClick={() => copyLink(slot.zoomLink!, slot.id)}
                                className="text-warm-grey hover:text-navy"
                                title="Copy Zoom link"
                              >
                                {copiedId === slot.id ? (
                                  <Check size={16} className="text-success" />
                                ) : (
                                  <Copy size={16} />
                                )}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
