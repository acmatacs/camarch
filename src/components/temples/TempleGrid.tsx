import TempleCard from "@/components/ui/TempleCard";
import type { TempleSummary } from "@/types";

interface TempleGridProps {
  temples: TempleSummary[];
  searchQuery?: string;
}

export default function TempleGrid({ temples, searchQuery }: TempleGridProps) {
  if (temples.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-charcoal/5 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-charcoal/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="font-heading text-xl font-semibold text-charcoal mb-2">
          No temples found
        </h3>
        <p className="font-body text-sm text-charcoal/50 max-w-sm">
          {searchQuery
            ? `No results for "${searchQuery}". Try adjusting your filters or search terms.`
            : "No temples match your current filters. Try clearing some filters."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {temples.map((temple) => (
        <TempleCard key={temple.id} temple={temple} />
      ))}
    </div>
  );
}
