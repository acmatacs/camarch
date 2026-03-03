"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { FiltersResponse } from "@/types";

interface FilterSidebarProps {
  filters: FiltersResponse;
  totalResults: number;
}

export default function FilterSidebar({ filters, totalResults }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [provinceId, setProvinceId] = useState(searchParams.get("provinceId") ?? "");
  const [eraId, setEraId] = useState(searchParams.get("eraId") ?? "");
  const [styleId, setStyleId] = useState(searchParams.get("styleId") ?? "");
  const [kingId, setKingId] = useState(searchParams.get("kingId") ?? "");
  const [religion, setReligion] = useState(searchParams.get("religion") ?? "");

  // Sync state when URL params change externally
  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
    setProvinceId(searchParams.get("provinceId") ?? "");
    setEraId(searchParams.get("eraId") ?? "");
    setStyleId(searchParams.get("styleId") ?? "");
    setKingId(searchParams.get("kingId") ?? "");
    setReligion(searchParams.get("religion") ?? "");
  }, [searchParams]);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (provinceId) params.set("provinceId", provinceId);
    if (eraId) params.set("eraId", eraId);
    if (styleId) params.set("styleId", styleId);
    if (kingId) params.set("kingId", kingId);
    if (religion) params.set("religion", religion);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
    setMobileOpen(false);
  }, [search, provinceId, eraId, styleId, kingId, religion, router, pathname]);

  const clearFilters = () => {
    setSearch("");
    setProvinceId("");
    setEraId("");
    setStyleId("");
    setKingId("");
    setReligion("");
    router.push(pathname);
  };

  const hasActiveFilters = !!(search || provinceId || eraId || styleId || kingId || religion);

  const religions = ["Hindu", "Buddhist", "Hindu (later Buddhist)"];

  const filterContent = (
    <div className="space-y-6">
      {/* Active filter count */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold text-charcoal">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="font-body text-xs text-gold hover:text-[#b06b2e] transition-colors duration-200 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear all
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="font-body text-xs text-charcoal/50">
        {totalResults} temple{totalResults !== 1 ? "s" : ""} found
      </p>

      {/* ─── Search ─── */}
      <div>
        <label className="block font-body text-xs font-medium text-charcoal/60 uppercase tracking-wider mb-2">
          Search
        </label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="Temple name…"
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-charcoal/15 bg-white font-body text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-jungle/30 focus:border-jungle/50 transition-all"
          />
        </div>
      </div>

      {/* ─── Province ─── */}
      <FilterSelect
        label="Province"
        value={provinceId}
        onChange={setProvinceId}
        options={filters.provinces.map((p) => ({ value: String(p.id), label: p.name }))}
        placeholder="All provinces"
      />

      {/* ─── Era ─── */}
      <FilterSelect
        label="Historical Era"
        value={eraId}
        onChange={setEraId}
        options={filters.eras.map((e) => ({ value: String(e.id), label: e.name }))}
        placeholder="All eras"
      />

      {/* ─── Architectural Style ─── */}
      <FilterSelect
        label="Architectural Style"
        value={styleId}
        onChange={setStyleId}
        options={filters.styles.map((s) => ({ value: String(s.id), label: s.name }))}
        placeholder="All styles"
      />

      {/* ─── King / Builder ─── */}
      <FilterSelect
        label="King / Builder"
        value={kingId}
        onChange={setKingId}
        options={filters.kings.map((k) => ({ value: String(k.id), label: k.name }))}
        placeholder="All kings"
      />

      {/* ─── Religion ─── */}
      <FilterSelect
        label="Religion"
        value={religion}
        onChange={setReligion}
        options={religions.map((r) => ({ value: r, label: r }))}
        placeholder="All religions"
      />

      {/* ─── Apply Button ─── */}
      <button onClick={applyFilters} className="btn-primary w-full justify-center">
        Apply Filters
      </button>
    </div>
  );

  return (
    <>
      {/* ─── Mobile toggle ─── */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg border border-charcoal/15 bg-white shadow-sm font-body text-sm text-charcoal"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-jungle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-jungle text-white text-[10px] font-bold">
                {[search, provinceId, eraId, styleId, kingId, religion].filter(Boolean).length}
              </span>
            )}
          </span>
          <svg className={`w-4 h-4 transition-transform ${mobileOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {mobileOpen && (
          <div className="mt-2 p-5 rounded-lg border border-charcoal/10 bg-white shadow-md">
            {filterContent}
          </div>
        )}
      </div>

      {/* ─── Desktop sidebar ─── */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 p-6 rounded-xl border border-charcoal/10 bg-white shadow-sm">
          {filterContent}
        </div>
      </aside>
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <div>
      <label className="block font-body text-xs font-medium text-charcoal/60 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 pl-3 pr-8 rounded-lg border border-charcoal/15 bg-white font-body text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-jungle/30 focus:border-jungle/50 appearance-none transition-all cursor-pointer"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
