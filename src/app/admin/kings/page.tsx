"use client";

import { useEffect, useState, useRef } from "react";

interface King {
  id: number;
  name: string;
  reignStart: number | null;
  reignEnd: number | null;
  description: string | null;
  _count: { temples: number };
}

type FormData = { name: string; reignStart: string; reignEnd: string; description: string };
const empty: FormData = { name: "", reignStart: "", reignEnd: "", description: "" };

export default function AdminKingsPage() {
  const [kings, setKings] = useState<King[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [modal, setModal] = useState<{ open: boolean; editing: King | null }>({ open: false, editing: null });
  const [form, setForm] = useState<FormData>(empty);
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  const fetchAll = () => {
    setLoading(true);
    fetch("/api/admin/kings")
      .then((r) => r.json())
      .then((d) => setKings(d.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setForm(empty);
    setError("");
    setModal({ open: true, editing: null });
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  const openEdit = (k: King) => {
    setForm({
      name: k.name,
      reignStart: k.reignStart != null ? String(k.reignStart) : "",
      reignEnd: k.reignEnd != null ? String(k.reignEnd) : "",
      description: k.description ?? "",
    });
    setError("");
    setModal({ open: true, editing: k });
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        reignStart: form.reignStart ? parseInt(form.reignStart) : null,
        reignEnd: form.reignEnd ? parseInt(form.reignEnd) : null,
        description: form.description.trim() || null,
      };
      const { editing } = modal;
      const res = editing
        ? await fetch(`/api/admin/kings/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/admin/kings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed."); return; }
      fetchAll();
      closeModal();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (k: King) => {
    if (!confirm(`Delete "${k.name}"? This cannot be undone.`)) return;
    setDeleting(k.id);
    try {
      const res = await fetch(`/api/admin/kings/${k.id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); alert(d.error ?? "Delete failed."); return; }
      setKings((prev) => prev.filter((x) => x.id !== k.id));
    } finally {
      setDeleting(null);
    }
  };

  const reignStr = (k: King) => {
    if (k.reignStart && k.reignEnd) return `${k.reignStart} – ${k.reignEnd} CE`;
    if (k.reignStart) return `from ${k.reignStart} CE`;
    if (k.reignEnd) return `until ${k.reignEnd} CE`;
    return null;
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-charcoal mb-1">Kings</h1>
          <p className="font-body text-sm text-charcoal/50">{kings.length} total</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2 px-4">+ Add King</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : kings.length === 0 ? (
          <div className="text-center py-20 font-body text-sm text-charcoal/40">
            No kings yet. <button onClick={openCreate} className="text-jungle underline">Add the first one →</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal/8 bg-charcoal/2">
                <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40">Name</th>
                <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden sm:table-cell">Reign</th>
                <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden md:table-cell">Description</th>
                <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 w-20">Temples</th>
                <th className="text-right px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {kings.map((k, i) => (
                <tr key={k.id} className={`border-b border-charcoal/5 last:border-0 ${i % 2 === 0 ? "" : "bg-charcoal/1"}`}>
                  <td className="px-5 py-3 font-body text-sm font-medium text-charcoal">{k.name}</td>
                  <td className="px-5 py-3 font-body text-sm text-charcoal/60 hidden sm:table-cell whitespace-nowrap">
                    {reignStr(k) ?? <span className="text-charcoal/25 italic">—</span>}
                  </td>
                  <td className="px-5 py-3 font-body text-sm text-charcoal/60 hidden md:table-cell max-w-xs truncate">
                    {k.description ?? <span className="text-charcoal/25 italic">—</span>}
                  </td>
                  <td className="px-5 py-3 font-body text-sm text-charcoal/50">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-charcoal/6 text-charcoal/60 text-xs">
                      {k._count.temples}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(k)} className="font-body text-xs text-jungle hover:underline">Edit</button>
                      <button
                        onClick={() => handleDelete(k)}
                        disabled={deleting === k.id}
                        className="font-body text-xs text-red-400 hover:text-red-600 disabled:opacity-40"
                      >
                        {deleting === k.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="font-heading text-lg text-charcoal mb-5">
              {modal.editing ? "Edit King" : "Add King"}
            </h2>
            {error && <p className="mb-4 text-sm font-body text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="block font-body text-xs uppercase tracking-wider text-charcoal/50 mb-1.5">Name *</label>
                <input
                  ref={nameRef}
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-charcoal/15 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                  placeholder="e.g. Jayavarman VII"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-body text-xs uppercase tracking-wider text-charcoal/50 mb-1.5">Reign Start (CE)</label>
                  <input
                    type="number"
                    value={form.reignStart}
                    onChange={(e) => setForm((f) => ({ ...f, reignStart: e.target.value }))}
                    className="w-full border border-charcoal/15 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                    placeholder="e.g. 1181"
                  />
                </div>
                <div>
                  <label className="block font-body text-xs uppercase tracking-wider text-charcoal/50 mb-1.5">Reign End (CE)</label>
                  <input
                    type="number"
                    value={form.reignEnd}
                    onChange={(e) => setForm((f) => ({ ...f, reignEnd: e.target.value }))}
                    className="w-full border border-charcoal/15 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                    placeholder="e.g. 1218"
                  />
                </div>
              </div>
              <div>
                <label className="block font-body text-xs uppercase tracking-wider text-charcoal/50 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-charcoal/15 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                  rows={3}
                  placeholder="Optional notes…"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeModal} className="px-4 py-2 font-body text-sm text-charcoal/60 hover:text-charcoal transition-colors">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary text-sm py-2 px-5 disabled:opacity-60"
              >
                {saving ? "Saving…" : modal.editing ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
