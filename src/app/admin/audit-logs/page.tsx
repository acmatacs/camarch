"use client";

import { useEffect, useState, useCallback } from "react";

const ALL_ACTION_TYPES = [
  "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGIN_FAILED", "LOGOUT", "EXPORT",
] as const;

type ActionType = (typeof ALL_ACTION_TYPES)[number];

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuditLog {
  id: string;
  action: ActionType;
  entityType: string | null;
  entityId: string | null;
  actorId: string | null;
  actorEmail: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Action badge colours ─────────────────────────────────────────────────────

const ACTION_BADGE: Record<string, string> = {
  CREATE: "bg-blue-100 text-blue-700",
  UPDATE: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-green-100 text-green-700",
  LOGOUT: "bg-gray-100 text-gray-600",
  LOGIN_FAILED: "bg-red-100 text-red-700",
  EXPORT: "bg-purple-100 text-purple-700",
};

// ─── JSON Diff helpers ────────────────────────────────────────────────────────

type DiffStatus = "added" | "removed" | "changed" | "unchanged";

interface DiffEntry {
  key: string;
  status: DiffStatus;
  oldVal: unknown;
  newVal: unknown;
}

function computeDiff(
  oldObj: Record<string, unknown> | null,
  newObj: Record<string, unknown> | null
): DiffEntry[] {
  const allKeys = new Set([
    ...Object.keys(oldObj ?? {}),
    ...Object.keys(newObj ?? {}),
  ]);
  const entries: DiffEntry[] = [];
  for (const key of allKeys) {
    const inOld = oldObj != null && key in oldObj;
    const inNew = newObj != null && key in newObj;
    const oldVal = oldObj?.[key];
    const newVal = newObj?.[key];
    let status: DiffStatus;
    if (!inOld) status = "added";
    else if (!inNew) status = "removed";
    else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) status = "changed";
    else status = "unchanged";
    entries.push({ key, status, oldVal, newVal });
  }
  // Sort: changed first, then added/removed, then unchanged
  const order: DiffStatus[] = ["changed", "added", "removed", "unchanged"];
  return entries.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
}

const DIFF_ROW_CLASSES: Record<DiffStatus, string> = {
  added: "bg-green-50",
  removed: "bg-red-50",
  changed: "bg-amber-50",
  unchanged: "",
};

const DIFF_LABEL_CLASSES: Record<DiffStatus, string> = {
  added: "text-green-700",
  removed: "text-red-700",
  changed: "text-amber-700",
  unchanged: "text-charcoal/40",
};

function Val({ v }: { v: unknown }) {
  if (v === null || v === undefined) return <span className="text-charcoal/30 italic">null</span>;
  if (typeof v === "object") return (
    <span className="font-mono text-[11px] text-charcoal/70 break-all">
      {JSON.stringify(v)}
    </span>
  );
  return <span className="font-mono text-[11px] text-charcoal/80 break-all">{String(v)}</span>;
}

// ─── Diff Modal ───────────────────────────────────────────────────────────────

function DiffModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  const diff = computeDiff(log.oldValues, log.newValues);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-charcoal/8">
          <div>
            <h2 className="font-heading text-lg text-charcoal">Audit Detail</h2>
            <p className="font-body text-xs text-charcoal/50 mt-0.5">
              {log.action}
              {log.entityType && ` · ${log.entityType}`}
              {log.entityId && ` #${log.entityId}`}
              {" · "}
              {new Date(log.createdAt).toLocaleString("en-GB", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit", second: "2-digit",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-charcoal/40 hover:text-charcoal transition text-xl leading-none ml-4"
          >
            ✕
          </button>
        </div>

        {/* Meta row */}
        <div className="px-6 py-3 border-b border-charcoal/8 flex flex-wrap gap-4 text-xs font-body text-charcoal/60">
          {log.actorEmail && <span><span className="text-charcoal/30">Actor: </span>{log.actorEmail}</span>}
          {log.ipAddress && <span><span className="text-charcoal/30">IP: </span><span className="font-mono">{log.ipAddress}</span></span>}
          {log.userAgent && <span className="truncate max-w-xs"><span className="text-charcoal/30">UA: </span>{log.userAgent}</span>}
        </div>

        {/* Diff table or raw JSON */}
        <div className="overflow-y-auto flex-1 p-6">
          {diff.length === 0 ? (
            <p className="text-charcoal/40 font-body text-sm text-center py-8">No data captured for this event.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-charcoal/8">
                  <th className="text-left pb-2 font-body text-[10px] uppercase tracking-widest text-charcoal/30 w-1/4">Field</th>
                  <th className="text-left pb-2 font-body text-[10px] uppercase tracking-widest text-charcoal/30 w-[37.5%]">Before</th>
                  <th className="text-left pb-2 font-body text-[10px] uppercase tracking-widest text-charcoal/30 w-[37.5%]">After</th>
                </tr>
              </thead>
              <tbody>
                {diff.map(({ key, status, oldVal, newVal }) => (
                  <tr key={key} className={`border-b border-charcoal/4 ${DIFF_ROW_CLASSES[status]}`}>
                    <td className={`py-1.5 pr-3 font-mono font-semibold ${DIFF_LABEL_CLASSES[status]}`}>
                      {key}
                    </td>
                    <td className="py-1.5 pr-3">
                      {status !== "added" ? <Val v={oldVal} /> : <span className="text-charcoal/20 italic text-[11px]">—</span>}
                    </td>
                    <td className="py-1.5">
                      {status !== "removed" ? <Val v={newVal} /> : <span className="text-charcoal/20 italic text-[11px]">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const inputCls =
  "font-body text-sm border border-charcoal/15 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-jungle/30 focus:border-jungle/40 transition";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Filters
  const [filterAction, setFilterAction] = useState("");
  const [filterEntityType, setFilterEntityType] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [emailInput, setEmailInput] = useState("");

  // Dynamic entity types from DB
  const [entityTypes, setEntityTypes] = useState<string[]>([]);

  // Detail modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Fetch distinct entity types once on mount
  useEffect(() => {
    fetch("/api/admin/audit-logs/entity-types")
      .then((r) => r.json())
      .then((d) => setEntityTypes(d.data ?? []))
      .catch(console.error);
  }, []);

  const fetchLogs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (filterAction) params.set("action", filterAction);
    if (filterEntityType) params.set("entityType", filterEntityType);
    if (filterEmail) params.set("actorEmail", filterEmail);

    fetch(`/api/admin/audit-logs?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setLogs(d.data ?? []);
        setMeta(d.meta ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, filterAction, filterEntityType, filterEmail]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  function applyEmailFilter() {
    setFilterEmail(emailInput.trim());
    setPage(1);
  }

  function clearFilters() {
    setFilterAction("");
    setFilterEntityType("");
    setFilterEmail("");
    setEmailInput("");
    setPage(1);
  }

  const hasFilters = filterAction || filterEntityType || filterEmail;

  return (
    <>
      {selectedLog && (
        <DiffModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}

      <div className="space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl text-charcoal">Audit Trail</h1>
            <p className="font-body text-sm text-charcoal/50 mt-0.5">
              {meta
                ? `${meta.total.toLocaleString()} immutable events recorded`
                : "Append-only record of all sensitive system actions"}
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="font-body text-xs text-charcoal/50 hover:text-charcoal border border-charcoal/15 rounded-lg px-3 py-1.5 hover:bg-charcoal/5 transition"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm p-4 flex flex-wrap gap-3 items-end">
          {/* Action */}
          <div className="flex flex-col gap-1">
            <label className="font-body text-[10px] uppercase tracking-widest text-charcoal/40">Action</label>
            <select
              className={inputCls}
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            >
              <option value="">All actions</option>
              {ALL_ACTION_TYPES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Entity Type — populated dynamically from DB */}
          <div className="flex flex-col gap-1">
            <label className="font-body text-[10px] uppercase tracking-widest text-charcoal/40">
              Entity Type
            </label>
            <select
              className={inputCls}
              value={filterEntityType}
              onChange={(e) => { setFilterEntityType(e.target.value); setPage(1); }}
            >
              <option value="">All entities</option>
              {entityTypes.map((et) => (
                <option key={et} value={et}>{et}</option>
              ))}
            </select>
          </div>

          {/* Actor email */}
          <div className="flex flex-col gap-1">
            <label className="font-body text-[10px] uppercase tracking-widest text-charcoal/40">Actor email</label>
            <div className="flex gap-2">
              <input
                className={inputCls}
                placeholder="admin@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyEmailFilter()}
              />
              <button
                onClick={applyEmailFilter}
                className="font-body text-sm bg-jungle text-white rounded-lg px-3 py-2 hover:bg-jungle/90 transition"
              >
                Search
              </button>
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="font-body text-sm text-charcoal/50 hover:text-charcoal border border-charcoal/15 rounded-lg px-3 py-2 hover:bg-charcoal/5 transition self-end"
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 text-charcoal/40 font-body text-sm">
              No audit events match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal/8 bg-charcoal/2">
                    <th className="text-left px-4 py-3 font-body text-[10px] uppercase tracking-widest text-charcoal/40 whitespace-nowrap">Timestamp</th>
                    <th className="text-left px-4 py-3 font-body text-[10px] uppercase tracking-widest text-charcoal/40">Actor</th>
                    <th className="text-left px-4 py-3 font-body text-[10px] uppercase tracking-widest text-charcoal/40">Action</th>
                    <th className="text-left px-4 py-3 font-body text-[10px] uppercase tracking-widest text-charcoal/40">Entity</th>
                    <th className="text-left px-4 py-3 font-body text-[10px] uppercase tracking-widest text-charcoal/40">IP</th>
                    <th className="text-left px-4 py-3 font-body text-[10px] uppercase tracking-widest text-charcoal/40">Diff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/4">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-charcoal/2 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-[11px] text-charcoal/50 whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-body text-xs">
                        {log.actorEmail ? (
                          <>
                            <span className="font-medium text-charcoal">{log.actorEmail}</span>
                            {log.actorId && <span className="text-charcoal/30 ml-1 text-[10px]">#{log.actorId}</span>}
                          </>
                        ) : (
                          <span className="text-charcoal/25">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-body text-[11px] font-semibold px-2 py-0.5 rounded-full tracking-wide ${ACTION_BADGE[log.action] ?? "bg-charcoal/10 text-charcoal/60"}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-charcoal/70">
                        {log.entityType ? (
                          <>
                            <span className="text-charcoal/40">{log.entityType}</span>
                            {log.entityId && <span className="font-mono text-charcoal/30 ml-1 text-[10px]">#{log.entityId}</span>}
                          </>
                        ) : (
                          <span className="text-charcoal/25">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-charcoal/40">
                        {log.ipAddress ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {(log.oldValues || log.newValues) ? (
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="font-body text-[11px] text-jungle hover:text-jungle/70 underline underline-offset-2 transition"
                          >
                            View diff
                          </button>
                        ) : (
                          <span className="text-charcoal/20 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="font-body text-xs text-charcoal/40">
              Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total.toLocaleString()} events
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="font-body text-xs border border-charcoal/15 rounded-lg px-3 py-1.5 hover:bg-charcoal/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                ← Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="font-body text-xs border border-charcoal/15 rounded-lg px-3 py-1.5 hover:bg-charcoal/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
