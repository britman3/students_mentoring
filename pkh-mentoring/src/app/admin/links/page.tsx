"use client";

import { useEffect, useState, useCallback } from "react";
import { Copy, Check, Download, AlertTriangle, Eye } from "lucide-react";

interface MagicLinkData {
  id: string;
  token: string;
  status: string;
  expiresAt: string | null;
  usedAt: string | null;
  createdAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function LinksPage() {
  const [links, setLinks] = useState<MagicLinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [showUnassigned, setShowUnassigned] = useState(false);
  const [count, setCount] = useState("10");
  const [batchNotes, setBatchNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);

  const fetchLinks = useCallback(() => {
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    fetch(`/api/admin/links?${params}`)
      .then((res) => res.json())
      .then(setLinks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  async function generateLinks(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: parseInt(count, 10), batchNotes }),
      });
      if (res.ok) { setCount("10"); setBatchNotes(""); fetchLinks(); }
    } catch (err) { console.error(err); } finally { setGenerating(false); }
  }

  async function revokeLink(id: string) {
    try {
      await fetch(`/api/admin/links/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revoke: true }) });
      setRevokeConfirm(null);
      fetchLinks();
    } catch (err) { console.error(err); }
  }

  function copyUrl(token: string, id: string) {
    const url = `${window.location.origin}/enrol/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function exportCSV() {
    const headers = ["Token", "URL", "Status", "Student Name", "Student Email", "Created"];
    const rows = links.map((l) => [
      l.token,
      `${window.location.origin}/enrol/${l.token}`,
      l.status,
      l.student?.name || "",
      l.student?.email || "",
      new Date(l.createdAt).toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `magic-links-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      UNUSED: "bg-sand-dark text-charcoal",
      SENT: "bg-info/10 text-info",
      OPENED: "bg-warning/10 text-warning",
      COMPLETED: "bg-success/10 text-success",
      USED: "bg-success/10 text-success",
      EXPIRED: "bg-warm-grey/10 text-warm-grey",
      REVOKED: "bg-error/10 text-error",
    };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-sand-dark text-charcoal"}`}>{status}</span>;
  }

  function getElapsedTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  const displayedLinks = showUnassigned ? links.filter((l) => l.status === "OPENED") : links;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-navy">Magic Link Management</h1>
        <button onClick={exportCSV} className="flex items-center gap-2 bg-navy hover:bg-navy-light text-white font-medium py-2 px-4 rounded-md transition-colors text-sm">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg border border-sand-dark shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-navy mb-4">Generate Links</h2>
        <form onSubmit={generateLinks} className="flex flex-col sm:flex-row gap-3">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Number (1-100)</label>
            <input type="number" min="1" max="100" value={count} onChange={(e) => setCount(e.target.value)}
              className="w-24 px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold text-sm" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-charcoal mb-1">Batch Notes (optional)</label>
            <input type="text" value={batchNotes} onChange={(e) => setBatchNotes(e.target.value)} placeholder="e.g. February cohort batch 1"
              className="w-full px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold text-sm" />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={generating}
              className="bg-navy hover:bg-navy-light text-white font-medium py-2 px-4 rounded-md transition-colors text-sm disabled:opacity-50">
              {generating ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-sand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-gold bg-white text-sm">
          <option value="">All Statuses</option>
          <option value="UNUSED">Unused</option>
          <option value="SENT">Sent</option>
          <option value="OPENED">Opened</option>
          <option value="COMPLETED">Completed</option>
          <option value="USED">Used</option>
          <option value="REVOKED">Revoked</option>
        </select>
        <button onClick={() => setShowUnassigned(!showUnassigned)}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${showUnassigned ? "bg-gold/10 border-gold text-gold-dark" : "border-sand-dark text-charcoal hover:bg-sand"}`}>
          <Eye size={16} /> Unassigned (Opened)
        </button>
      </div>

      {showUnassigned && (
        <div className="bg-warning/10 border border-warning/30 rounded-md p-3 mb-4 flex items-center gap-2 text-sm text-charcoal">
          <AlertTriangle size={16} className="text-warning" />
          Showing links that were opened but not completed (visited without finishing enrolment)
        </div>
      )}

      <div className="bg-white rounded-lg border border-sand-dark shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sand-dark bg-sand">
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Token</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">URL</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Student</th>
                {showUnassigned && (
                  <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Elapsed</th>
                )}
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Created</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-warm-grey uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={showUnassigned ? 7 : 6} className="px-6 py-8 text-center text-warm-grey">Loading...</td></tr>}
              {!loading && displayedLinks.length === 0 && <tr><td colSpan={showUnassigned ? 7 : 6} className="px-6 py-8 text-center text-warm-grey">No links found</td></tr>}
              {displayedLinks.map((link, i) => (
                <tr key={link.id} className={i % 2 === 1 ? "bg-sand" : "bg-white"}>
                  <td className="px-6 py-3 text-sm text-charcoal font-mono">{link.token.slice(0, 8)}...</td>
                  <td className="px-6 py-3">
                    <button onClick={() => copyUrl(link.token, link.id)} className="flex items-center gap-1 text-sm text-navy hover:text-navy-light font-medium">
                      {copiedId === link.id ? <><Check size={14} className="text-success" /> Copied</> : <><Copy size={14} /> Copy URL</>}
                    </button>
                  </td>
                  <td className="px-6 py-3">{getStatusBadge(link.status)}</td>
                  <td className="px-6 py-3 text-sm text-charcoal">{link.student ? link.student.name : "—"}</td>
                  {showUnassigned && (
                    <td className="px-6 py-3 text-sm text-charcoal">{link.usedAt ? getElapsedTime(link.usedAt) : "—"}</td>
                  )}
                  <td className="px-6 py-3 text-sm text-warm-grey">{new Date(link.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-3">
                    {link.status === "UNUSED" && (
                      revokeConfirm === link.id ? (
                        <div className="flex gap-2">
                          <button onClick={() => revokeLink(link.id)} className="text-xs bg-error hover:bg-error/90 text-white px-2 py-1 rounded">Confirm</button>
                          <button onClick={() => setRevokeConfirm(null)} className="text-xs text-charcoal hover:text-navy">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setRevokeConfirm(link.id)} className="text-sm text-error hover:text-error/80 font-medium">Revoke</button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
