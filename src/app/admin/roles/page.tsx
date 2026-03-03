"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Permission {
  id: number;
  action: string;
  module: string;
  description: string | null;
}

interface Role {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: Permission[];
  _count: { users: number };
}


// ─── New Role Modal ───────────────────────────────────────────────────────────

function NewRoleModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (role: Role) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null, permissionIds: [] }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create role."); return; }
      onCreated(data.data);
      onClose();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h2 className="font-heading text-lg text-charcoal mb-4">Create Custom Role</h2>
        {error && <p className="mb-3 text-sm font-body text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <div className="space-y-3">
          <div>
            <label className="block font-body text-xs uppercase tracking-wider text-charcoal/50 mb-1">Name *</label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="w-full border border-charcoal/15 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
              placeholder="e.g. Media Editor"
            />
          </div>
          <div>
            <label className="block font-body text-xs uppercase tracking-wider text-charcoal/50 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-charcoal/15 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
              placeholder="Optional description"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-4 py-2 font-body text-sm text-charcoal/60 hover:text-charcoal transition">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className="btn-primary text-sm py-2 px-4 disabled:opacity-60">
            {saving ? "Creating…" : "Create Role"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/roles").then((r) => r.json()),
      fetch("/api/admin/permissions").then((r) => r.json()),
    ]).then(([rolesRes, permsRes]) => {
      setRoles(rolesRes.data ?? []);
      setPermissions(permsRes.data ?? []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-select first role on load
  useEffect(() => {
    if (roles.length > 0 && selectedRoleId === null) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;

  // ── Filter permissions by search ────────────────────────────────────────

  const filteredPermissions = useMemo(() => {
    if (!search.trim()) return permissions;
    const q = search.toLowerCase();
    return permissions.filter(
      (p) =>
        p.action.toLowerCase().includes(q) ||
        p.module.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
    );
  }, [permissions, search]);

  const modules = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    for (const p of filteredPermissions) {
      (groups[p.module] ??= []).push(p);
    }
    return Object.keys(groups).sort().map((m) => ({ module: m, perms: groups[m] }));
  }, [filteredPermissions]);

  // ── Toggle a single permission for the selected role ────────────────────

  const togglePermission = async (perm: Permission) => {
    if (!selectedRole) return;
    const hasIt = selectedRole.permissions.some((p) => p.id === perm.id);
    const newPermIds = hasIt
      ? selectedRole.permissions.filter((p) => p.id !== perm.id).map((p) => p.id)
      : [...selectedRole.permissions.map((p) => p.id), perm.id];

    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== selectedRole.id) return r;
        return { ...r, permissions: permissions.filter((p) => newPermIds.includes(p.id)) };
      })
    );

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/roles/${selectedRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionIds: newPermIds }),
      });
      if (!res.ok) { fetchData(); showToast("Failed to save — changes reverted."); }
    } catch {
      fetchData();
      showToast("Failed to save — changes reverted.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete a custom role ────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!selectedRole) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/roles/${selectedRole.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Delete failed."); return; }
      const remaining = roles.filter((r) => r.id !== selectedRole.id);
      setRoles(remaining);
      setSelectedRoleId(remaining[0]?.id ?? null);
      showToast(`Role "${selectedRole.name}" deleted.`);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      {showCreate && (
        <NewRoleModal
          onClose={() => setShowCreate(false)}
          onCreated={(role) => {
            setRoles((prev) => [...prev, role]);
            setSelectedRoleId(role.id);
            showToast(`Role "${role.name}" created.`);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-charcoal text-sandstone font-body text-sm px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <div className="space-y-5">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl text-charcoal">Roles &amp; Permissions</h1>
            <p className="font-body text-sm text-charcoal/50 mt-0.5">
              Select a role to view and manage its permissions.
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm py-2 px-4 shrink-0">
            + New Role
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex gap-5 items-start">

            {/* ── Left: Role list ───────────────────────────────────────────────────────── */}
            <div className="w-56 shrink-0 space-y-1">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => { setSelectedRoleId(role.id); setSearch(""); setConfirmDelete(false); }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl transition-all border ${
                    selectedRoleId === role.id
                      ? "bg-jungle text-white border-jungle shadow-sm"
                      : "bg-white text-charcoal border-charcoal/8 hover:border-jungle/30 hover:bg-jungle/5"
                  }`}
                >
                  <div className={`font-body text-sm font-semibold leading-tight ${
                    selectedRoleId === role.id ? "text-white" : "text-charcoal"
                  }`}>
                    {role.name}
                  </div>
                  <div className={`flex items-center gap-1.5 mt-1 ${
                    selectedRoleId === role.id ? "text-white/60" : "text-charcoal/40"
                  }`}>
                    <span className={`font-body text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full ${
                      selectedRoleId === role.id
                        ? "bg-white/20 text-white/80"
                        : role.isSystem ? "bg-charcoal/8 text-charcoal/40" : "bg-jungle/10 text-jungle"
                    }`}>
                      {role.isSystem ? "System" : "Custom"}
                    </span>
                    <span className="font-body text-[10px]">
                      {role._count.users} user{role._count.users !== 1 ? "s" : ""}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* ── Right: Permission detail ─────────────────────────────────────────── */}
            {selectedRole ? (
              <div className="flex-1 min-w-0 bg-white rounded-xl border border-charcoal/8 shadow-sm overflow-hidden">

                {/* Role header */}
                <div className="px-6 py-4 border-b border-charcoal/8 bg-charcoal/[0.015] flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="font-heading text-lg text-charcoal">{selectedRole.name}</h2>
                      <span className={`font-body text-[9px] uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        selectedRole.isSystem
                          ? "bg-charcoal/8 text-charcoal/40"
                          : "bg-jungle/10 text-jungle"
                      }`}>
                        {selectedRole.isSystem ? "System Role" : "Custom Role"}
                      </span>
                      {saving && (
                        <div className="w-3.5 h-3.5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                    {selectedRole.description && (
                      <p className="font-body text-sm text-charcoal/50 mt-0.5">{selectedRole.description}</p>
                    )}
                    <p className="font-body text-xs text-charcoal/30 mt-1">
                      {selectedRole.permissions.length} permission{selectedRole.permissions.length !== 1 ? "s" : ""} granted
                      {" · "}
                      {selectedRole._count.users} user{selectedRole._count.users !== 1 ? "s" : ""} assigned
                    </p>
                  </div>

                  {!selectedRole.isSystem && (
                    <div className="shrink-0 flex items-center gap-2">
                      {confirmDelete ? (
                        <>
                          <span className="font-body text-xs text-charcoal/50">Sure?</span>
                          <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="font-body text-xs text-red-500 hover:text-red-700 font-semibold disabled:opacity-40 transition"
                          >
                            {deleting ? "Deleting…" : "Yes, delete"}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(false)}
                            className="font-body text-xs text-charcoal/40 hover:text-charcoal transition"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(true)}
                          className="font-body text-xs text-red-400 hover:text-red-600 transition px-2 py-1 rounded border border-red-200 hover:border-red-300"
                        >
                          Delete Role
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Search */}
                <div className="px-6 py-3 border-b border-charcoal/8">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search permissions…"
                      className="w-full pl-8 pr-8 py-1.5 font-body text-sm border border-charcoal/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-charcoal/60 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Permissions list */}
                {modules.length === 0 ? (
                  <div className="py-16 text-center font-body text-sm text-charcoal/30">
                    No permissions match &ldquo;{search}&rdquo;
                  </div>
                ) : (
                  <div className="divide-y divide-charcoal/5">
                    {modules.map(({ module, perms }) => (
                      <div key={module}>
                        <div className="px-6 py-2 bg-sandstone/50">
                          <span className="font-body text-[10px] uppercase tracking-widest text-charcoal/40">
                            {module}
                          </span>
                        </div>
                        {perms.map((perm) => {
                          const granted = selectedRole.permissions.some((p) => p.id === perm.id);
                          return (
                            <label
                              key={perm.id}
                              className="flex items-center justify-between px-6 py-3.5 hover:bg-charcoal/[0.015] cursor-pointer transition-colors border-t border-charcoal/4"
                            >
                              <div className="min-w-0 pr-6">
                                <div className="font-mono text-sm text-charcoal">{perm.action}</div>
                                {perm.description && (
                                  <div className="font-body text-xs text-charcoal/40 mt-0.5">{perm.description}</div>
                                )}
                              </div>
                              <input
                                type="checkbox"
                                checked={granted}
                                onChange={() => togglePermission(perm)}
                                disabled={saving}
                                className="w-4 h-4 rounded border-charcoal/20 accent-jungle cursor-pointer disabled:cursor-wait shrink-0"
                              />
                            </label>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}

                {selectedRole.isSystem && (
                  <div className="px-6 py-3 border-t border-charcoal/8 bg-charcoal/[0.015]">
                    <p className="font-body text-xs text-charcoal/35 italic">
                      System roles cannot be renamed or deleted, but their permissions can be adjusted.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center py-32 text-charcoal/30 font-body text-sm">
                Select a role from the left to manage its permissions.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
