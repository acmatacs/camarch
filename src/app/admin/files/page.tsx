"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface ContentVersion {
  id: number;
  versionNumber: number;
  url: string;
  mimeType: string;
  sizeBytes: number | null;
  isCurrent: boolean;
  accessLevel: string;
  createdAt: string;
  uploadedBy: { id: number; name: string | null; email: string } | null;
}

interface ContentDocument {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  temple: { id: number; name: string; slug: string };
  versions: ContentVersion[];
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function isImage(mimeType: string) {
  return mimeType.startsWith("image/");
}

export default function AdminFilesPage() {
  const [docs, setDocs] = useState<ContentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const fetchDocs = () => {
    setLoading(true);
    // Fetch all documents by getting all temples first, then querying files
    // We use the content-documents API with no templeId to get all
    fetch("/api/admin/content-documents")
      .then((r) => r.json())
      .then((d) => setDocs(d.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleDelete = async (doc: ContentDocument) => {
    if (!confirm(`Delete "${doc.title}"? All versions will be permanently removed.`)) return;
    setDeleting(doc.id);
    try {
      await fetch(`/api/admin/content-documents/${doc.id}`, { method: "DELETE" });
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch {
      alert("Failed to delete file.");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = docs.filter((d) =>
    !search ||
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.temple.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl text-charcoal mb-1">Files</h1>
          <p className="font-body text-sm text-charcoal/50">{docs.length} total</p>
        </div>
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or temple…"
            className="w-full pl-9 pr-3 py-2 text-sm font-body border border-charcoal/15 rounded-lg bg-white placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-jungle/30 focus:border-jungle"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 font-body text-sm text-charcoal/40">
            {search ? "No files match your search." : "No files uploaded yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal/8 bg-charcoal/2">
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 w-10" />
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40">File</th>
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden sm:table-cell">Temple</th>
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden md:table-cell">Type</th>
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden lg:table-cell">Size</th>
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden lg:table-cell">Uploaded By</th>
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden xl:table-cell">Updated</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/6">
                {filtered.map((doc) => {
                  const current = doc.versions.find((v) => v.isCurrent) ?? doc.versions[0];
                  const uploader = current?.uploadedBy;
                  return (
                    <tr key={doc.id} className="hover:bg-charcoal/2 transition-colors group">
                      {/* Thumbnail */}
                      <td className="px-5 py-3">
                        <div className="w-9 h-9 rounded-md overflow-hidden bg-charcoal/5 shrink-0 flex items-center justify-center">
                          {current && isImage(current.mimeType) ? (
                            <Image
                              src={current.url}
                              alt={doc.title}
                              width={36}
                              height={36}
                              className="object-cover w-full h-full"
                              unoptimized
                            />
                          ) : (
                            <svg className="w-4 h-4 text-charcoal/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          )}
                        </div>
                      </td>

                      {/* Title + version */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/content-documents/${doc.id}`}
                            className="font-body text-sm font-medium text-charcoal hover:text-jungle transition-colors"
                          >
                            {doc.title}
                          </Link>
                          {current && (
                            <span className="text-[10px] font-body font-bold bg-charcoal/10 text-charcoal/50 px-1.5 py-0.5 rounded">
                              v{current.versionNumber}
                            </span>
                          )}
                          {doc.versions.length > 1 && (
                            <span className="text-[10px] font-body text-charcoal/30">
                              ({doc.versions.length} versions)
                            </span>
                          )}
                        </div>
                        {current?.accessLevel === "INTERNAL_ONLY" && (
                          <span className="inline-block mt-0.5 text-[9px] font-body font-semibold uppercase tracking-wide bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded">
                            Private
                          </span>
                        )}
                      </td>

                      {/* Temple */}
                      <td className="px-5 py-3 hidden sm:table-cell">
                        <Link
                          href={`/admin/temples/${doc.temple.id}`}
                          className="font-body text-sm text-charcoal/60 hover:text-jungle transition-colors"
                        >
                          {doc.temple.name}
                        </Link>
                      </td>

                      {/* MIME */}
                      <td className="px-5 py-3 hidden md:table-cell">
                        <span className="font-body text-xs text-charcoal/40">{current?.mimeType ?? "—"}</span>
                      </td>

                      {/* Size */}
                      <td className="px-5 py-3 hidden lg:table-cell">
                        <span className="font-body text-sm text-charcoal/60">{formatSize(current?.sizeBytes ?? null)}</span>
                      </td>

                      {/* Uploader */}
                      <td className="px-5 py-3 hidden lg:table-cell">
                        <span className="font-body text-sm text-charcoal/60">
                          {uploader?.name ?? uploader?.email ?? <span className="text-charcoal/25">—</span>}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3 hidden xl:table-cell">
                        <span className="font-body text-sm text-charcoal/40">{timeAgo(doc.updatedAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          {current && (
                            <a
                              href={current.url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-body text-xs text-charcoal/40 hover:text-charcoal px-2 py-1 rounded hover:bg-charcoal/5 transition-colors"
                            >
                              Download
                            </a>
                          )}
                          <Link
                            href={`/admin/content-documents/${doc.id}`}
                            className="font-body text-xs text-jungle hover:underline px-2 py-1 rounded hover:bg-jungle/5"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(doc)}
                            disabled={deleting === doc.id}
                            className="font-body text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50 disabled:opacity-40"
                          >
                            {deleting === doc.id ? "…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
