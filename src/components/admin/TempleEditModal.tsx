"use client";

import { useEffect, useRef, useState } from "react";
import TempleForm from "./TempleForm";

type TempleStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED";

interface FullTemple {
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
  province: { id: number; name: string };
  era: { id: number; name: string } | null;
  style: { id: number; name: string } | null;
  king: { id: number; name: string } | null;
}

interface TempleEditModalProps {
  templeId: number;
  onClose: () => void;
  onSaved: () => void;
}

export default function TempleEditModal({ templeId, onClose, onSaved }: TempleEditModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [temple, setTemple] = useState<FullTemple | null>(null);
  const [fetchError, setFetchError] = useState(false);

  // Fetch full temple data
  useEffect(() => {
    fetch(`/api/admin/temples/${templeId}`)
      .then((r) => r.json())
      .then((d) => setTemple(d.data ?? null))
      .catch(() => setFetchError(true));
  }, [templeId]);

  // Trap scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const initialData = temple
    ? {
        name: temple.name,
        khmerName: temple.khmerName ?? "",
        slug: temple.slug,
        description: temple.description,
        history: temple.history ?? "",
        featuredImage: temple.featuredImage ?? "",
        galleryImages: temple.galleryImages ?? [],
        latitude: String(temple.latitude ?? ""),
        longitude: String(temple.longitude ?? ""),
        yearBuilt: temple.yearBuilt != null ? String(temple.yearBuilt) : "",
        religion: temple.religion ?? "",
        provinceId: String(temple.province?.id ?? ""),
        kingId: temple.king ? String(temple.king.id) : "",
        styleId: temple.style ? String(temple.style.id) : "",
        eraId: temple.era ? String(temple.era.id) : "",
        status: temple.status,
      }
    : undefined;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-[2px] overflow-y-auto py-10 px-4"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-charcoal/10">

        {/* ── Modal Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-charcoal/10 sticky top-0 z-10">
          <div>
            <h2 className="font-heading text-lg text-charcoal">Edit Temple</h2>
            {temple?.name && (
              <p className="font-body text-xs text-charcoal/45 mt-0.5">{temple.name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {temple && (
              <button
                form="temple-form"
                type="submit"
                className="btn-primary text-sm py-2 px-5"
              >
                Save
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-charcoal/40 hover:text-charcoal hover:bg-charcoal/8 transition-colors"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className="bg-[#f3f3f3] p-6">
          {fetchError ? (
            <p className="font-body text-sm text-red-500 text-center py-8">Failed to load temple data.</p>
          ) : !temple ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <TempleForm
              mode="edit"
              templeId={templeId}
              initialData={initialData}
              onSuccess={() => { onSaved(); onClose(); }}
            />
          )}
        </div>

      </div>
    </div>
  );
}
