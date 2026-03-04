"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { FiltersResponse } from "@/types";

type TempleStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED";

interface TempleFormData {
  name: string;
  khmerName: string;
  slug: string;
  description: string;
  history: string;
  featuredImage: string;
  galleryImages: string; // comma-separated
  latitude: string;
  longitude: string;
  yearBuilt: string;
  religion: string;
  provinceId: string;
  kingId: string;
  styleId: string;
  eraId: string;
  status: TempleStatus;
}

interface TempleFormInitial extends Omit<Partial<TempleFormData>, "galleryImages"> {
  galleryImages?: string | string[];
}

interface TempleFormProps {
  mode: "create" | "edit";
  templeId?: number;
  initialData?: TempleFormInitial;
}

const EMPTY: TempleFormData = {
  name: "", khmerName: "", slug: "", description: "", history: "",
  featuredImage: "", galleryImages: "", latitude: "", longitude: "",
  yearBuilt: "", religion: "", provinceId: "", kingId: "",
  styleId: "", eraId: "", status: "DRAFT",
};

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function TempleForm({ mode, templeId, initialData }: TempleFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<TempleFormData>(() => ({
    ...EMPTY,
    ...initialData,
    status: (initialData?.status as TempleStatus | undefined) ?? "DRAFT",
    galleryImages: Array.isArray(initialData?.galleryImages)
      ? (initialData.galleryImages as string[]).join(", ")
      : (initialData?.galleryImages as string | undefined) ?? "",
  }));
  const [filters, setFilters] = useState<FiltersResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(mode === "edit");

  useEffect(() => {
    fetch("/api/filters")
      .then((r) => r.json())
      .then(setFilters)
      .catch(console.error);
  }, []);

  const set = useCallback(<K extends keyof TempleFormData>(key: K, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !slugEdited) {
        next.slug = slugify(value);
      }
      return next;
    });
  }, [slugEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      galleryImages: form.galleryImages
        ? form.galleryImages.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      status: form.status,
    };

    try {
      const url = mode === "create" ? "/api/admin/temples" : `/api/admin/temples/${templeId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      router.push("/admin/temples");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-charcoal/15 font-body text-sm text-charcoal bg-white placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-jungle/30 focus:border-jungle transition-all duration-150";
  const labelCls = "block font-body text-xs text-charcoal/60 uppercase tracking-wide mb-1.5";
  const requiredStar = <span className="text-red-400 ml-0.5">*</span>;

  return (
    <form id="temple-form" onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-body px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* ─── Identity ─────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-charcoal/8 shadow-sm p-6 space-y-5">
        <h2 className="font-heading text-sm text-charcoal border-b border-charcoal/8 pb-3">
          Identity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Name {requiredStar}</label>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Angkor Wat"
              required
            />
          </div>
          <div>
            <label className={labelCls}>Khmer Name</label>
            <input
              className={inputCls}
              value={form.khmerName}
              onChange={(e) => set("khmerName", e.target.value)}
              placeholder="អង្គរវត្ត"
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Slug {requiredStar}</label>
          <input
            className={inputCls}
            value={form.slug}
            onChange={(e) => {
              setSlugEdited(true);
              set("slug", e.target.value);
            }}
            placeholder="angkor-wat"
            required
          />
          <p className="font-body text-[10px] text-charcoal/35 mt-1">Auto-generated from name. Used in URL: /temples/{form.slug || "..."}</p>
        </div>
      </section>

      {/* ─── Description ─────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-charcoal/8 shadow-sm p-6 space-y-5">
        <h2 className="font-heading text-sm text-charcoal border-b border-charcoal/8 pb-3">
          Content
        </h2>
        <div>
          <label className={labelCls}>Description {requiredStar}</label>
          <textarea
            className={`${inputCls} resize-y min-h-[100px]`}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="A short overview of the temple and its significance…"
            required
          />
        </div>
        <div>
          <label className={labelCls}>Historical Background</label>
          <textarea
            className={`${inputCls} resize-y min-h-[120px]`}
            value={form.history}
            onChange={(e) => set("history", e.target.value)}
            placeholder="Longer historical narrative…"
          />
        </div>
      </section>

      {/* ─── Images ───────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-charcoal/8 shadow-sm p-6 space-y-5">
        <h2 className="font-heading text-sm text-charcoal border-b border-charcoal/8 pb-3">
          Images
        </h2>
        <div>
          <label className={labelCls}>Featured Image URL</label>
          <input
            className={inputCls}
            value={form.featuredImage}
            onChange={(e) => set("featuredImage", e.target.value)}
            placeholder="https://picsum.photos/seed/angkor-wat/1280/720"
            type="url"
          />
        </div>
        <div>
          <label className={labelCls}>Gallery Images (comma-separated URLs)</label>
          <textarea
            className={`${inputCls} resize-y min-h-[80px]`}
            value={form.galleryImages}
            onChange={(e) => set("galleryImages", e.target.value)}
            placeholder="https://picsum.photos/seed/angkor-1/800/600, https://picsum.photos/seed/angkor-2/800/600"
          />
        </div>
      </section>

      {/* ─── Status ───────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-charcoal/8 shadow-sm p-6 space-y-5">
        <h2 className="font-heading text-sm text-charcoal border-b border-charcoal/8 pb-3">
          Publication Status
        </h2>
        <div>
          <label className={labelCls}>Status</label>
          <select
            className={inputCls}
            value={form.status}
            onChange={(e) => set("status", e.target.value as TempleStatus)}
          >
            <option value="DRAFT">Draft — not visible to public</option>
            <option value="PENDING_REVIEW">Pending Review — awaiting approval</option>
            <option value="PUBLISHED">Published — live on site</option>
            <option value="ARCHIVED">Archived — hidden from public</option>
          </select>
          <p className="font-body text-[10px] text-charcoal/35 mt-1">
            Only Heritage Managers and Admins can publish a temple.
          </p>
        </div>
      </section>

      {/* ─── Location ─────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-charcoal/8 shadow-sm p-6 space-y-5">
        <h2 className="font-heading text-sm text-charcoal border-b border-charcoal/8 pb-3">
          Location
        </h2>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Latitude {requiredStar}</label>
            <input
              className={inputCls}
              value={form.latitude}
              onChange={(e) => set("latitude", e.target.value)}
              placeholder="13.4125"
              type="number"
              step="any"
              required
            />
          </div>
          <div>
            <label className={labelCls}>Longitude {requiredStar}</label>
            <input
              className={inputCls}
              value={form.longitude}
              onChange={(e) => set("longitude", e.target.value)}
              placeholder="103.8670"
              type="number"
              step="any"
              required
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Province {requiredStar}</label>
          <select
            className={inputCls}
            value={form.provinceId}
            onChange={(e) => set("provinceId", e.target.value)}
            required
          >
            <option value="">— Select province —</option>
            {filters?.provinces.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </section>

      {/* ─── Historical Details ───────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-charcoal/8 shadow-sm p-6 space-y-5">
        <h2 className="font-heading text-sm text-charcoal border-b border-charcoal/8 pb-3">
          Historical Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Year Built</label>
            <input
              className={inputCls}
              value={form.yearBuilt}
              onChange={(e) => set("yearBuilt", e.target.value)}
              placeholder="1122"
              type="number"
            />
          </div>
          <div>
            <label className={labelCls}>Religion</label>
            <select className={inputCls} value={form.religion} onChange={(e) => set("religion", e.target.value)}>
              <option value="">— Select —</option>
              <option value="Hindu">Hindu</option>
              <option value="Buddhist">Buddhist</option>
              <option value="Mixed Hindu-Buddhist">Mixed Hindu-Buddhist</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>King</label>
            <select className={inputCls} value={form.kingId} onChange={(e) => set("kingId", e.target.value)}>
              <option value="">— None —</option>
              {filters?.kings.map((k) => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Era</label>
            <select className={inputCls} value={form.eraId} onChange={(e) => set("eraId", e.target.value)}>
              <option value="">— None —</option>
              {filters?.eras.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Architectural Style</label>
            <select className={inputCls} value={form.styleId} onChange={(e) => set("styleId", e.target.value)}>
              <option value="">— None —</option>
              {filters?.styles.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ─── Submit ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 pb-8">
        <button type="submit" disabled={saving} className="btn-gold py-2.5 px-6 disabled:opacity-50">
          {saving ? "Saving…" : mode === "create" ? "Create Temple" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/temples")}
          className="btn-outline py-2.5 px-6"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
