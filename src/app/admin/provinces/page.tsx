"use client";

import { useEffect, useState, useRef } from "react";

interface Province {
  id: number;
  name: string;
  description: string | null;
  _count: { temples: number };
}

type FormData = { name: string; description: string };
const empty: FormData = { name: "", description: "" };

export default function AdminProvincesPage() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [modal, setModal] = useState<{ open: boolean; editing: Province | null }>({ open: false, editing: null });
  const [form, setForm] = useState<FormData>(empty);
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  const fetchAll = () => {
    setLoading(true);
    fetch("/api/admin/provinces")
      .then((r) => r.json())
      .then((d) => setProvinces(d.data ?? []))
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

  const openEdit = (p: Province) => {
    setForm({ name: p.name, description: p.description ?? "" });
    setError("");
    setModal({ open: true, editing: p });
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = { name: form.name.trim(), description: form.description.trim() || null };
      const { editing } = modal;
      const res = editing
        ? await fetch(`/api/admin/provinces/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/admin/provinces", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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

  const handleDelete = async (p: Province) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setDeleting(p.id);
    try {
      const res = await fetch(`/api/admin/provinces/${p.id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); alert(d.error ?? "Delete failed."); return; }
      setProvinces((prev) => prev.filter((x) => x.id !== p.id));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-charcoal mb-1">Provinces</h1>
          <p className="font-body text-sm text-charcoal/50">{provinces.length} total</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2 px-4">+ Add Province</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : provinces.length === 0 ? (
          <div className="text-center py-20 font-body text-sm text-charcoal/40">
            No provinces yet. <button onClick={openCreate} className="text-jungle underline">Add the first one →</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal/8 bg-charcoal/2">
                <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40">Name</th>
                <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden sm:table-cell">Description</th>
                <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 w-20">Temples</th>
                <th className="text-right px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {provinces.map((p, i) => (
                <tr key={p.id} className={`border-b border-charcoal/5 last:border-0 ${i % 2 === 0 ? "" : "bg-charcoal/1"}`}>
                  <td className="px-5 py-3 font-body text-sm font-medium text-charcoal">{p.name}</td>
                  <td className="px-5 py-3 font-body text-sm text-charcoal/60 hidden sm:table-cell max-w-xs truncate">
                    {p.description ?? <span className="text-charcoal/25 italic">—</span>}
                  </td>
                  <td className="px-5 py-3 font-body text-sm text-charcoal/50">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-charcoal/6 text-charcoal/60 text-xs">
                      {p._count.temples}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="font-body text-xs text-jungle hover:underline">Edit</button>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={deleting === p.id}
                        className="font-body text-xs text-red-400 hover:text-red-600 disabled:opacity-40"
                      >
                        {deleting === p.id ? "…" : "Delete"}
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
              {modal.editing ? "Edit Province" : "Add Province"}
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
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  className="w-full border border-charcoal/15 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                  placeholder="e.g. Siem Reap"
                />
              </div>
              <div>
                <label className="block font-body text-xs uppercase tracking-wider text-charcoal/50 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-charcoal/15 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                  rows={3}
                  placeholder="Optional description…"
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
