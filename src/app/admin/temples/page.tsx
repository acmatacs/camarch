"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import TempleEditModal from "@/components/admin/TempleEditModal";

type TempleStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED";

const STATUS_LABELS: Record<TempleStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "In Review",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const STATUS_CLASSES: Record<TempleStatus, string> = {
  DRAFT: "bg-charcoal/8 text-charcoal/60",
  PENDING_REVIEW: "bg-gold/15 text-amber-700",
  PUBLISHED: "bg-jungle/10 text-jungle",
  ARCHIVED: "bg-charcoal/8 text-charcoal/35",
};

interface AdminTemple {
  id: number;
  name: string;
  slug: string;
  featuredImage: string;
  yearBuilt: number | null;
  religion: string | null;
  status: TempleStatus;
  province: { name: string };
  era: { name: string } | null;
  style: { name: string } | null;
}

export default function AdminTemplesPage() {
  const [temples, setTemples] = useState<AdminTemple[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [approving, setApproving] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [editingTemple, setEditingTemple] = useState<AdminTemple | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTemples = () => {
    setLoading(true);
    fetch("/api/admin/temples")
      .then((r) => r.json())
      .then((d) => setTemples(d.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTemples(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/temples/${id}`, { method: "DELETE" });
      setTemples((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Failed to delete temple.");
    } finally {
      setDeleting(null);
    }
  };

  const handleApprove = async (id: number, status: TempleStatus) => {
    setApproving(id);
    try {
      const res = await fetch(`/api/admin/temples/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "Failed to update status");
        return;
      }
      const { data } = await res.json();
      setTemples((prev) => prev.map((t) => (t.id === id ? { ...t, status: data.status } : t)));
    } catch {
      alert("Failed to update status.");
    } finally {
      setApproving(null);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/temples/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setImportResult(`Error: ${data.error ?? "Import failed"}`);
        return;
      }
      setImportResult(`Imported ${data.data.imported} temples successfully.`);
      fetchTemples();
    } catch {
      setImportResult("Network error during import.");
    } finally {
      setImporting(false);
    }
  };

  const handleExport = (format: "csv" | "geojson") => {
    window.open(`/api/admin/temples/export?format=${format}`, "_blank");
  };

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl text-charcoal mb-1">Temples</h1>
          <p className="font-body text-sm text-charcoal/50">{temples.length} total</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Import */}
          <label className={`inline-flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-lg border border-charcoal/15 font-body text-sm text-charcoal/70 hover:bg-charcoal/4 transition-colors ${importing ? "opacity-50 pointer-events-none" : ""}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            {importing ? "Importing…" : "Import CSV"}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              disabled={importing}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ""; }}
            />
          </label>
          {/* Export */}
          <button onClick={() => handleExport("csv")} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-charcoal/15 font-body text-sm text-charcoal/70 hover:bg-charcoal/4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
            CSV
          </button>
          <button onClick={() => handleExport("geojson")} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-charcoal/15 font-body text-sm text-charcoal/70 hover:bg-charcoal/4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
            GeoJSON
          </button>
          <Link href="/admin/temples/new" className="btn-primary text-sm py-2 px-4">
            + Add Temple
          </Link>
        </div>
      </div>

      {/* Import result */}
      {importResult && (
        <div className={`font-body text-sm px-4 py-2.5 rounded-lg border ${importResult.startsWith("Error") ? "bg-red-50 border-red-200 text-red-700" : "bg-jungle/5 border-jungle/20 text-jungle"}`}>
          {importResult}
          <button onClick={() => setImportResult(null)} className="ml-3 text-charcoal/40 hover:text-charcoal">×</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : temples.length === 0 ? (
          <div className="text-center py-20 font-body text-sm text-charcoal/40">
            No temples yet. <Link href="/admin/temples/new" className="text-jungle underline">Add the first one →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal/8 bg-charcoal/2">
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 w-12" />
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40">Name</th>
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden sm:table-cell">Province</th>
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden md:table-cell">Style</th>
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden lg:table-cell">Year</th>
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/6">
                {temples.map((temple) => (
                  <tr key={temple.id} className="hover:bg-charcoal/2 transition-colors group">
                    {/* Thumbnail */}
                    <td className="px-5 py-3">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-charcoal/5 shrink-0">
                        <Image
                          src={temple.featuredImage || `https://picsum.photos/seed/${temple.slug}/80/80`}
                          alt={temple.name}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/temples/${temple.id}`} className="font-body text-sm font-medium text-charcoal hover:text-jungle transition-colors">{temple.name}</Link>
                      <p className="font-body text-xs text-charcoal/35">/temples/{temple.slug}</p>
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-charcoal/60 hidden sm:table-cell">
                      {temple.province.name}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-charcoal/60 hidden md:table-cell">
                      {temple.style?.name ?? <span className="text-charcoal/25">—</span>}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-charcoal/60 hidden lg:table-cell">
                      {temple.yearBuilt ?? <span className="text-charcoal/25">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block font-body text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_CLASSES[temple.status]}`}>
                        {STATUS_LABELS[temple.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        {temple.status === "PENDING_REVIEW" && (
                          <button
                            onClick={() => handleApprove(temple.id, "PUBLISHED")}
                            disabled={approving === temple.id}
                            className="font-body text-xs text-jungle hover:underline px-2 py-1 rounded hover:bg-jungle/5 disabled:opacity-40"
                          >
                            Publish
                          </button>
                        )}
                        {temple.status === "PUBLISHED" && (
                          <button
                            onClick={() => handleApprove(temple.id, "ARCHIVED")}
                            disabled={approving === temple.id}
                            className="font-body text-xs text-charcoal/40 hover:text-charcoal px-2 py-1 rounded hover:bg-charcoal/5 disabled:opacity-40"
                          >
                            Archive
                          </button>
                        )}
                        <Link
                          href={`/admin/temples/${temple.id}`}
                          className="font-body text-xs text-charcoal/40 hover:text-charcoal transition-colors px-2 py-1 rounded hover:bg-charcoal/5"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => setEditingTemple(temple)}
                          className="font-body text-xs text-jungle hover:underline px-2 py-1 rounded hover:bg-jungle/5"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(temple.id, temple.name)}
                          disabled={deleting === temple.id}
                          className="font-body text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50 disabled:opacity-40"
                        >
                          {deleting === temple.id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

      {/* ── Edit Modal ─────────────────────────────────────────────── */}
      {editingTemple && (
        <TempleEditModal
          templeId={editingTemple.id}
          onClose={() => setEditingTemple(null)}
          onSaved={() => { fetchTemples(); setEditingTemple(null); }}
        />
      )}
    </>
  );
}
