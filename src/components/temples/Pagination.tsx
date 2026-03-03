"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
}

export default function Pagination({ currentPage, totalPages, total, limit }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Build page numbers with ellipsis
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  return (
    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Results summary */}
      <p className="font-body text-sm text-charcoal/50">
        Showing <span className="font-medium text-charcoal">{start}–{end}</span> of{" "}
        <span className="font-medium text-charcoal">{total}</span> temples
      </p>

      {/* Pages */}
      <div className="flex items-center gap-1.5">
        {/* Prev */}
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-charcoal/15 text-charcoal/50 hover:border-jungle hover:text-jungle disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {pages.map((page, i) =>
          page === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 font-body text-sm text-charcoal/30">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => goTo(page as number)}
              className={`flex items-center justify-center w-9 h-9 rounded-lg font-body text-sm transition-all duration-200 ${
                page === currentPage
                  ? "bg-jungle text-white shadow-sm"
                  : "border border-charcoal/15 text-charcoal/60 hover:border-jungle hover:text-jungle"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-charcoal/15 text-charcoal/50 hover:border-jungle hover:text-jungle disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Next page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
