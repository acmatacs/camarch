"use client";

import { useEffect, useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminRole {
  id: number;
  name: string;
}

interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  isActive: boolean;
  roleId: number | null;
  role: AdminRole | null;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  email: string;
  name: string;
  password: string;
  roleId: string; // string for <select> value binding
}

const empty: FormData = { email: "", name: "", password: "", roleId: "" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function getInitials(user: AdminUser) {
  if (user.name) {
    return user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }
  return user.email[0].toUpperCase();
}

// ─── Page ────────────────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-charcoal/15 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);
  const [selfId, setSelfId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [modal, setModal] = useState<{ open: boolean; editing: AdminUser | null }>({
    open: false,
    editing: null,
  });
  const [form, setForm] = useState<FormData>(empty);
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);

  // Fetch current user identity + user list + roles on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/auth/me").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/roles").then((r) => r.json()),
    ]).then(([me, list, rolesList]) => {
      if (me.data?.id) setSelfId(me.data.id);
      setUsers(list.data ?? []);
      setRoles(rolesList.data ?? []);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.data ?? []))
      .catch(console.error);
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm(empty);
    setError("");
    setShowPassword(false);
    setModal({ open: true, editing: null });
    setTimeout(() => emailRef.current?.focus(), 50);
  };

  const openEdit = (u: AdminUser) => {
    setForm({ email: u.email, name: u.name ?? "", password: "", roleId: String(u.roleId ?? "") });
    setError("");
    setShowPassword(false);
    setModal({ open: true, editing: u });
    setTimeout(() => emailRef.current?.focus(), 50);
  };

  const closeModal = () => setModal({ open: false, editing: null });

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.email.trim()) { setError("Email is required."); return; }
    if (!form.roleId) { setError("Please select a role."); return; }
    if (!modal.editing && !form.password.trim()) { setError("Password is required for new accounts."); return; }
    if (form.password && form.password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setSaving(true);
    setError("");

    try {
      const payload: Record<string, unknown> = {
        email: form.email.trim(),
        name: form.name.trim() || null,
        roleId: parseInt(form.roleId),
      };
      if (!modal.editing || form.password) payload.password = form.password;

      const { editing } = modal;
      const res = editing
        ? await fetch(`/api/admin/users/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed."); return; }

      fetchUsers();
      closeModal();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active status ─────────────────────────────────────────────────────

  const handleToggleActive = async (u: AdminUser) => {
    setToggling(u.id);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !u.isActive }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "Update failed.");
        return;
      }
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, isActive: !u.isActive } : x))
      );
    } finally {
      setToggling(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="font-heading text-lg text-charcoal mb-5">
              {modal.editing ? "Edit Admin Account" : "Add Admin Account"}
            </h2>

            {error && (
              <p className="mb-4 text-sm font-body text-red-500 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block font-body text-xs uppercase tracking-wider text-charcoal/50 mb-1.5">
                  Email *
                </label>
                <input
                  ref={emailRef}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={inputCls}
                  placeholder="admin@example.com"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block font-body text-xs uppercase tracking-wider text-charcoal/50 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputCls}
                  placeholder="e.g. Acmatac Seing"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block font-body text-xs uppercase tracking-wider text-charcoal/50 mb-1.5">
                  Role *
                </label>
                <select
                  value={form.roleId}
                  onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                  className={inputCls}
                >
                  <option value="">Select a role…</option>
                  {roles.map((r) => (
                    <option key={r.id} value={String(r.id)}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block font-body text-xs uppercase tracking-wider text-charcoal/50 mb-1.5">
                  {modal.editing ? "New Password" : "Password *"}
                  {modal.editing && (
                    <span className="normal-case ml-1 text-charcoal/30">(leave blank to keep current)</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    className={`${inputCls} pr-10`}
                    placeholder={modal.editing ? "••••••••" : "Min. 8 characters"}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-charcoal/60 transition text-xs font-body"
                    tabIndex={-1}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 font-body text-sm text-charcoal/60 hover:text-charcoal transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary text-sm py-2 px-5 disabled:opacity-60"
              >
                {saving ? "Saving…" : modal.editing ? "Save Changes" : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl text-charcoal">Admin Accounts</h1>
            <p className="font-body text-sm text-charcoal/50 mt-0.5">
              {users.length} {users.length === 1 ? "account" : "accounts"} with admin access
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary text-sm py-2 px-4">
            + Add Account
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 font-body text-sm text-charcoal/40">
              No admin accounts found.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal/8 bg-charcoal/2">
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40">Account</th>
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden sm:table-cell">Role</th>
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden md:table-cell">Created</th>
                  <th className="text-right px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {users.map((u) => {
                  const isSelf = u.id === selfId;
                  return (
                    <tr key={u.id} className="hover:bg-charcoal/1 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-body text-xs font-semibold shrink-0 ${
                            u.isActive ? "bg-jungle/10 text-jungle" : "bg-charcoal/8 text-charcoal/30"
                          }`}>
                            {getInitials(u)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-body text-sm font-medium ${
                                u.isActive ? "text-charcoal" : "text-charcoal/40"
                              }`}>
                                {u.name ?? u.email}
                              </span>
                              {isSelf && (
                                <span className="font-body text-[10px] bg-gold/15 text-gold px-1.5 py-0.5 rounded-full font-semibold tracking-wide">
                                  YOU
                                </span>
                              )}
                              {!u.isActive && (
                                <span className="font-body text-[10px] bg-red-50 text-red-400 px-1.5 py-0.5 rounded-full font-semibold tracking-wide">
                                  INACTIVE
                                </span>
                              )}
                            </div>
                            {u.name && (
                              <div className={`font-body text-xs ${
                                u.isActive ? "text-charcoal/50" : "text-charcoal/30"
                              }`}>{u.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        {u.role ? (
                          <span className="font-body text-xs bg-jungle/10 text-jungle px-2 py-0.5 rounded-full font-semibold tracking-wide">
                            {u.role.name}
                          </span>
                        ) : (
                          <span className="font-body text-xs text-charcoal/30 italic">No role</span>
                        )}
                      </td>
                      <td className="px-5 py-3 font-body text-xs text-charcoal/50 hidden md:table-cell">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => openEdit(u)}
                            className="font-body text-xs text-jungle hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => !isSelf && handleToggleActive(u)}
                            disabled={isSelf || toggling === u.id}
                            title={isSelf ? "You cannot change your own status" : undefined}
                            className={`font-body text-xs disabled:opacity-25 disabled:cursor-not-allowed transition ${
                              u.isActive
                                ? "text-red-400 hover:text-red-600"
                                : "text-jungle hover:text-jungle/80"
                            }`}
                          >
                            {toggling === u.id ? "…" : u.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Security note */}
        <p className="font-body text-xs text-charcoal/30 text-center">
          All account changes are recorded in the audit trail. Inactive accounts cannot log in.
        </p>
      </div>
    </>
  );
}
