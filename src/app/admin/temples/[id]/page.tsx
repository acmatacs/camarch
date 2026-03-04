"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import TempleEditModal from "@/components/admin/TempleEditModal";
import FilesRelatedList from "@/components/admin/FilesRelatedList";

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

interface Temple {
  id: number;
  name: string;
  khmerName: string | null;
  slug: string;
  description: string;
  history: string | null;
  featuredImage: string;
  galleryImages: string[];
  latitude: number;
  longitude: number;
  yearBuilt: number | null;
  religion: string | null;
  status: TempleStatus;
  createdAt: string;
  updatedAt: string;
  province: { id: number; name: string };
  era: { id: number; name: string } | null;
  style: { id: number; name: string } | null;
  king: { id: number; name: string } | null;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="font-body text-[10px] uppercase tracking-wide text-charcoal/40 mb-1">{label}</dt>
      <dd className="font-body text-sm text-charcoal">
        {value ?? <span className="text-charcoal/25">—</span>}
      </dd>
    </div>
  );
}

export default function TempleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [temple, setTemple] = useState<Temple | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const fetchTemple = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/temples/${id}`)
      .then((r) => r.json())
      .then((d) => setTemple(d.data ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchTemple(); }, [fetchTemple]);

  const handleDelete = async () => {
    if (!temple || !confirm(`Delete "${temple.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/temples/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/temples");
      } else {
        alert("Failed to delete temple.");
      }
    } catch {
      alert("Failed to delete temple.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!temple) {
    return (
      <div className="text-center py-32 font-body text-sm text-charcoal/40">
        Temple not found.{" "}
        <Link href="/admin/temples" className="text-jungle underline">← Back to Temples</Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm px-6 py-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 font-body text-xs text-charcoal/40 mb-2 flex-wrap">
            <Link href="/admin" className="hover:text-charcoal transition-colors">Dashboard</Link>
            <span>/</span>
            <Link href="/admin/temples" className="hover:text-charcoal transition-colors">Temples</Link>
            <span>/</span>
            <span className="text-charcoal">{temple.name}</span>
          </nav>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {/* Featured image */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-charcoal/5 shrink-0">
                <Image
                  src={temple.featuredImage || `https://picsum.photos/seed/${temple.slug}/56/56`}
                  alt={temple.name}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-heading text-2xl text-charcoal">{temple.name}</h1>
                  <span className={`font-body text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_CLASSES[temple.status]}`}>
                    {STATUS_LABELS[temple.status]}
                  </span>
                </div>
                {temple.khmerName && (
                  <p className="font-body text-sm text-charcoal/45 mt-0.5">{temple.khmerName}</p>
                )}
                <p className="font-body text-xs text-charcoal/30 mt-0.5">/temples/{temple.slug}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`/temples/${temple.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-charcoal/15 font-body text-sm text-charcoal/60 hover:bg-charcoal/4 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Public Page
              </a>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 font-body text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={() => setEditOpen(true)}
                className="btn-primary text-sm py-2 px-5"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* ── Main grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column — detail sections */}
          <div className="lg:col-span-2 space-y-5">

            {/* Details */}
            <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm p-6">
              <h2 className="font-heading text-xs text-charcoal/50 uppercase tracking-wide pb-3 border-b border-charcoal/8 mb-4">
                Temple Details
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <Field label="Province" value={temple.province.name} />
                <Field label="Style" value={temple.style?.name} />
                <Field label="Era" value={temple.era?.name} />
                <Field label="King / Patron" value={temple.king?.name} />
                <Field label="Year Built" value={temple.yearBuilt} />
                <Field label="Religion" value={temple.religion} />
                <Field label="Latitude" value={temple.latitude} />
                <Field label="Longitude" value={temple.longitude} />
              </dl>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm p-6">
              <h2 className="font-heading text-xs text-charcoal/50 uppercase tracking-wide pb-3 border-b border-charcoal/8 mb-4">
                Content
              </h2>
              <dl className="space-y-5">
                <div>
                  <dt className="font-body text-[10px] uppercase tracking-wide text-charcoal/40 mb-1.5">Description</dt>
                  <dd className="font-body text-sm text-charcoal leading-relaxed whitespace-pre-line">
                    {temple.description || <span className="text-charcoal/25">—</span>}
                  </dd>
                </div>
                {temple.history && (
                  <div>
                    <dt className="font-body text-[10px] uppercase tracking-wide text-charcoal/40 mb-1.5">Historical Background</dt>
                    <dd className="font-body text-sm text-charcoal leading-relaxed whitespace-pre-line">{temple.history}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Files */}
            <FilesRelatedList templeId={temple.id} />

          </div>

          {/* Right column — record info */}
          <div className="space-y-5">

            {/* Gallery preview */}
            {temple.galleryImages?.length > 0 && (
              <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm p-5">
                <h3 className="font-heading text-xs text-charcoal/50 uppercase tracking-wide pb-3 border-b border-charcoal/8 mb-3">
                  Gallery
                </h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {temple.galleryImages.slice(0, 6).map((src, i) => (
                    <div key={i} className="aspect-square rounded-md overflow-hidden bg-charcoal/5">
                      <Image src={src} alt="" width={80} height={80} className="object-cover w-full h-full" unoptimized />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Record Info */}
            <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm p-5">
              <h3 className="font-heading text-xs text-charcoal/50 uppercase tracking-wide pb-3 border-b border-charcoal/8 mb-4">
                Record Info
              </h3>
              <dl className="space-y-4">
                <Field label="Record ID" value={`#${temple.id}`} />
                <Field label="Slug" value={temple.slug} />
                <Field
                  label="Created"
                  value={new Date(temple.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                />
                <Field
                  label="Last Modified"
                  value={new Date(temple.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                />
              </dl>
              <div className="mt-4 pt-4 border-t border-charcoal/8">
                <Link
                  href={`/admin/temples/${temple.id}/edit`}
                  className="font-body text-xs text-charcoal/40 hover:text-charcoal transition-colors"
                >
                  Open full edit page →
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── Edit Modal ────────────────────────────────────────────────── */}
      {editOpen && (
        <TempleEditModal
          templeId={temple.id}
          onClose={() => setEditOpen(false)}
          onSaved={fetchTemple}
        />
      )}
    </>
  );
}
