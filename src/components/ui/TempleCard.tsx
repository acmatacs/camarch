import Image from "next/image";
import Link from "next/link";
import type { TempleSummary } from "@/types";

interface TempleCardProps {
  temple: TempleSummary;
  className?: string;
}

export default function TempleCard({ temple, className = "" }: TempleCardProps) {
  return (
    <Link
      href={`/temples/${temple.slug}`}
      className={`group card flex flex-col ${className}`}
    >
      {/* ─── Image ─── */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-charcoal/5">
        <Image
          src={temple.featuredImage}
          alt={temple.name}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Era badge overlay */}
        {temple.era && (
          <span className="absolute top-3 left-3 badge bg-[#1A1C1E]/80 text-sandstone/90 text-[10px] tracking-wider backdrop-blur-sm">
            {temple.era.name}
          </span>
        )}
      </div>

      {/* ─── Body ─── */}
      <div className="flex-1 flex flex-col p-5">
        {/* Province */}
        <div className="flex items-center gap-1.5 mb-2">
          <svg
            className="w-3.5 h-3.5 text-gold shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="font-body text-xs text-charcoal/50">
            {temple.province.name}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-heading text-lg font-semibold text-charcoal mb-1 leading-snug group-hover:text-jungle transition-colors duration-200">
          {temple.name}
        </h3>

        {/* Khmer name */}
        {temple.khmerName && (
          <p className="font-body text-xs text-charcoal/40 mb-3">{temple.khmerName}</p>
        )}

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-charcoal/6">
          {temple.style && (
            <span className="badge-jungle text-[10px]">{temple.style.name}</span>
          )}
          {temple.religion && (
            <span className="badge bg-gold/10 text-gold text-[10px]">
              {temple.religion.split(" ")[0]}
            </span>
          )}
          {temple.yearBuilt && (
            <span className="badge bg-charcoal/5 text-charcoal/50 text-[10px]">
              c. {temple.yearBuilt}
            </span>
          )}
        </div>
      </div>

      {/* ─── Footer CTA ─── */}
      <div className="px-5 pb-5">
        <span className="flex items-center gap-1.5 font-body text-xs font-medium text-jungle group-hover:gap-2.5 transition-all duration-200">
          View Temple
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
