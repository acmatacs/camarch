import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import FilterSidebar from "@/components/temples/FilterSidebar";
import TempleGrid from "@/components/temples/TempleGrid";
import Pagination from "@/components/temples/Pagination";
import type { FiltersResponse, TempleSummary } from "@/types";

export const metadata: Metadata = {
  title: "Explore Temples",
  description:
    "Browse all Cambodian archaeological sites and temples. Filter by province, era, architectural style, religion and more.",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    provinceId?: string;
    eraId?: string;
    styleId?: string;
    kingId?: string;
    religion?: string;
    page?: string;
  }>;
}

async function getFilters(): Promise<FiltersResponse> {
  const [provinces, eras, styles, kings] = await Promise.all([
    prisma.province.findMany({ orderBy: { name: "asc" } }),
    prisma.era.findMany({ orderBy: { name: "asc" } }),
    prisma.style.findMany({ orderBy: { name: "asc" } }),
    prisma.king.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { provinces, eras, styles, kings };
}

async function getTemples(params: Awaited<PageProps["searchParams"]>) {
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = {
    ...(params.search && {
      OR: [
        { name: { contains: params.search, mode: "insensitive" as const } },
        { khmerName: { contains: params.search, mode: "insensitive" as const } },
        { description: { contains: params.search, mode: "insensitive" as const } },
      ],
    }),
    ...(params.provinceId && { provinceId: parseInt(params.provinceId) }),
    ...(params.eraId && { eraId: parseInt(params.eraId) }),
    ...(params.styleId && { styleId: parseInt(params.styleId) }),
    ...(params.kingId && { kingId: parseInt(params.kingId) }),
    ...(params.religion && {
      religion: { contains: params.religion, mode: "insensitive" as const },
    }),
  };

  const [temples, total] = await Promise.all([
    prisma.temple.findMany({
      where,
      include: {
        province: { select: { id: true, name: true } },
        era: { select: { id: true, name: true } },
        style: { select: { id: true, name: true } },
        king: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.temple.count({ where }),
  ]);

  return { temples: temples as unknown as TempleSummary[], total, page, limit };
}

export default async function TemplesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [filters, { temples, total, page, limit }] = await Promise.all([
    getFilters(),
    getTemples(params),
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasActiveFilters = !!(
    params.search ||
    params.provinceId ||
    params.eraId ||
    params.styleId ||
    params.kingId ||
    params.religion
  );

  return (
    <div className="min-h-screen bg-sandstone">
      {/* ─── Page Header ─── */}
      <div className="bg-[#1A1C1E] pt-28 pb-16">
        <div className="section-wrapper">
          <div className="flex items-center gap-2 font-body text-xs text-sandstone/40 mb-4">
            <span>Home</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sandstone/70">Temples</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-sandstone mb-3">
            Cambodian Temples
          </h1>
          <p className="font-body text-base text-sandstone/60 max-w-xl">
            Explore our database of Cambodian archaeological sites. Use the
            filters to narrow down by province, era, style, and more.
          </p>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="section-wrapper py-12">
        {/* Active filter pills */}
        {hasActiveFilters && (
          <ActiveFilterPills params={params} filters={filters} />
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <Suspense>
            <FilterSidebar filters={filters} totalResults={total} />
          </Suspense>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="font-body text-sm text-charcoal/50">
                {params.search ? (
                  <>
                    Results for{" "}
                    <span className="font-medium text-charcoal">
                      &ldquo;{params.search}&rdquo;
                    </span>
                  </>
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-medium text-charcoal">{total}</span>{" "}
                    temple{total !== 1 ? "s" : ""}
                  </>
                )}
              </p>
            </div>

            <TempleGrid temples={temples} searchQuery={params.search} />

            <Suspense>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Active filter pill strip ────────────────────────────────────────────────
function ActiveFilterPills({
  params,
  filters,
}: {
  params: Awaited<PageProps["searchParams"]>;
  filters: FiltersResponse;
}) {
  const pills: { label: string; key: string }[] = [];

  if (params.search) pills.push({ label: `"${params.search}"`, key: "search" });
  if (params.provinceId) {
    const p = filters.provinces.find((x) => String(x.id) === params.provinceId);
    if (p) pills.push({ label: p.name, key: "provinceId" });
  }
  if (params.eraId) {
    const e = filters.eras.find((x) => String(x.id) === params.eraId);
    if (e) pills.push({ label: e.name, key: "eraId" });
  }
  if (params.styleId) {
    const s = filters.styles.find((x) => String(x.id) === params.styleId);
    if (s) pills.push({ label: s.name, key: "styleId" });
  }
  if (params.kingId) {
    const k = filters.kings.find((x) => String(x.id) === params.kingId);
    if (k) pills.push({ label: k.name, key: "kingId" });
  }
  if (params.religion) pills.push({ label: params.religion, key: "religion" });

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="font-body text-xs text-charcoal/40 mr-1">Active:</span>
      {pills.map((pill) => (
        <span
          key={pill.key}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-jungle/10 text-jungle font-body text-xs font-medium"
        >
          {pill.label}
        </span>
      ))}
    </div>
  );
}
