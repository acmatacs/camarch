"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

// ── Types ────────────────────────────────────────────────────────────────────

interface Uploader {
  id: number;
  name: string | null;
  email: string;
}

interface ContentVersion {
  id: number;
  versionNumber: number;
  url: string;
  storagePath: string | null;
  mimeType: string;
  sizeBytes: number | null;
  accessLevel: "PUBLIC" | "INTERNAL_ONLY";
  isCurrent: boolean;
  createdAt: string;
  uploadedBy: Uploader | null;
}

interface ContentDocument {
  id: number;
  title: string;
  templeId: number;
  createdAt: string;
  updatedAt: string;
  versions: ContentVersion[]; // latest version in list; all versions when expanded
}

interface Props {
  templeId: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function FileIcon({ mimeType }: { mimeType: string }) {
  const isImage = mimeType.startsWith("image/");
  return (
    <div className="w-9 h-9 rounded-lg bg-sandstone/30 flex items-center justify-center flex-shrink-0">
      {isImage ? (
        <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-charcoal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function FilesRelatedList({ templeId }: Props) {
  const [docs, setDocs] = useState<ContentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<"new" | number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const newFileRef = useRef<HTMLInputElement>(null);
  const versionFileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const loadDocs = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/content-documents?templeId=${templeId}`);
      const json = await res.json();
      setDocs(json.data ?? []);
    } catch {
      // silently fail — handled by loading state
    } finally {
      setLoading(false);
    }
  }, [templeId]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  // ── Upload helpers ─────────────────────────────────────────────────────────

  async function doUpload(file: File): Promise<{ url: string; storagePath: string; mimeType: string; sizeBytes: number }> {
    // Step 1: Get pre-signed URL
    const urlRes = await fetch("/api/admin/media/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, mimeType: file.type, sizeBytes: file.size, templeId }),
    });
    if (!urlRes.ok) {
      const err = await urlRes.json();
      throw new Error(err.error ?? "Failed to get upload URL");
    }
    const { data: uploadData } = await urlRes.json();

    // Step 2: PUT file to Supabase Storage
    const putRes = await fetch(uploadData.signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!putRes.ok) throw new Error("Upload to storage failed");

    return {
      url: uploadData.publicUrl,
      storagePath: uploadData.storagePath,
      mimeType: uploadData.mimeType,
      sizeBytes: uploadData.sizeBytes,
    };
  }

  async function handleUploadNew(file: File) {
    setUploading("new");
    setUploadError(null);
    try {
      const { url, storagePath, mimeType, sizeBytes } = await doUpload(file);
      const saveRes = await fetch("/api/admin/content-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: file.name, url, storagePath, mimeType, sizeBytes, templeId, accessLevel: "PUBLIC" }),
      });
      if (!saveRes.ok) throw new Error("Failed to save document record");
      await loadDocs();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  async function handleUploadVersion(file: File, docId: number) {
    setUploading(docId);
    setUploadError(null);
    try {
      const { url, storagePath, mimeType, sizeBytes } = await doUpload(file);
      const saveRes = await fetch(`/api/admin/content-documents/${docId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, storagePath, mimeType, sizeBytes, accessLevel: "PUBLIC" }),
      });
      if (!saveRes.ok) throw new Error("Failed to save version record");
      await loadDocs();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  async function handleDelete(docId: number) {
    if (!confirm("Delete this file and all its versions? This cannot be undone.")) return;
    try {
      await fetch(`/api/admin/content-documents/${docId}`, { method: "DELETE" });
      setDocs((prev) => prev.filter((d) => d.id !== docId));
    } catch {
      alert("Failed to delete file.");
    }
  }

  // ── Render helpers ──────────────────────────────────────────────────────────

  const latestVersion = (doc: ContentDocument): ContentVersion | undefined =>
    doc.versions.find((v) => v.isCurrent) ?? doc.versions[0];

  const btnCls = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-charcoal/15 font-body text-xs text-charcoal/70 hover:bg-charcoal/5 transition-colors";
  const iconBtnCls = "w-7 h-7 rounded-lg flex items-center justify-center text-charcoal/40 hover:text-charcoal hover:bg-charcoal/5 transition-colors";

  return (
    <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal/8">
        <div className="flex items-center gap-2.5">
          <h3 className="font-heading text-sm text-charcoal">Files</h3>
          <span className="text-[10px] font-body font-semibold bg-charcoal/8 text-charcoal/55 px-2 py-0.5 rounded-full">
            {docs.length}
          </span>
        </div>
        <label className={`${btnCls} cursor-pointer ${uploading === "new" ? "opacity-50 pointer-events-none" : ""}`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          {uploading === "new" ? "Uploading…" : "Upload File"}
          <input
            ref={newFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploading !== null}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadNew(f); e.target.value = ""; }}
          />
        </label>
      </div>

      {/* ── Upload error ───────────────────────────────────────────────── */}
      {uploadError && (
        <div className="px-5 py-2 bg-red-50 border-b border-red-100">
          <p className="font-body text-xs text-red-600">{uploadError}</p>
        </div>
      )}

      {/* ── File list ──────────────────────────────────────────────────── */}
      {loading ? (
        <div className="px-5 py-8 text-center font-body text-xs text-charcoal/30">Loading…</div>
      ) : docs.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <svg className="w-8 h-8 text-charcoal/15 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="font-body text-xs text-charcoal/30">No files attached</p>
        </div>
      ) : (
        <ul className="divide-y divide-charcoal/5">
          {docs.map((doc) => {
            const latest = latestVersion(doc);
            const isUploadingVersion = uploading === doc.id;

            return (
              <li key={doc.id}>
                {/* ── Document row ──────────────────────────────────────── */}
                <div className="flex items-start gap-3 px-5 py-3 hover:bg-charcoal/[0.02] group">
                  {/* Thumbnail or icon */}
                  <div
                    className="cursor-pointer flex-shrink-0 mt-0.5"
                    onClick={() => latest?.url && setPreview(latest.url)}
                    title="Preview"
                  >
                    {latest?.mimeType.startsWith("image/") ? (
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-charcoal/5 relative">
                        <Image src={latest.url} alt={doc.title} fill className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <FileIcon mimeType={latest?.mimeType ?? "application/octet-stream"} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/admin/content-documents/${doc.id}`}
                        className="font-body text-sm text-jungle hover:underline truncate max-w-[180px]"
                        title={doc.title}
                      >
                        {doc.title}
                      </Link>
                      {/* Version badge */}
                      <span className="text-[10px] font-body font-semibold bg-jungle/10 text-jungle px-1.5 py-0.5 rounded">
                        v{latest?.versionNumber ?? 1}
                      </span>
                      {/* Access badge */}
                      {latest?.accessLevel === "INTERNAL_ONLY" && (
                        <span className="text-[10px] font-body font-semibold bg-gold/15 text-gold/80 px-1.5 py-0.5 rounded">
                          PRIVATE
                        </span>
                      )}
                    </div>
                    <p className="font-body text-[11px] text-charcoal/40 mt-0.5">
                      {formatSize(latest?.sizeBytes ?? null)}
                      {latest?.uploadedBy && ` · ${latest.uploadedBy.name ?? latest.uploadedBy.email}`}
                      {latest && ` · ${timeAgo(latest.createdAt)}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {/* Preview */}
                    {latest?.mimeType.startsWith("image/") && (
                      <button
                        type="button"
                        className={iconBtnCls}
                        title="Preview"
                        onClick={() => setPreview(latest.url)}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    )}
                    {/* Download */}
                    {latest && (
                      <a
                        href={latest.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className={iconBtnCls}
                        title="Download"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </a>
                    )}
                    {/* Upload new version */}
                    <label
                      className={`${iconBtnCls} cursor-pointer ${isUploadingVersion ? "opacity-50 pointer-events-none" : ""}`}
                      title="Upload new version"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      <input
                        ref={(el) => { versionFileRefs.current[doc.id] = el; }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={uploading !== null}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadVersion(f, doc.id); e.target.value = ""; }}
                      />
                    </label>
                    {/* Delete */}
                    <button
                      type="button"
                      className={`${iconBtnCls} hover:text-red-500 hover:bg-red-50`}
                      title="Delete file"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="px-5 py-2 border-t border-charcoal/5">
        <p className="font-body text-[10px] text-charcoal/25">JPEG, PNG or WebP · max 10 MB · hover a file to upload a new version</p>
      </div>

      {/* ── Lightbox preview ──────────────────────────────────────────── */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" />
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-3 -right-3 w-7 h-7 bg-white text-charcoal rounded-full text-sm flex items-center justify-center shadow-lg hover:bg-charcoal hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
