import Link from "next/link";
import Image from "next/image";
import type { TempleSummary } from "@/types";

interface NearbyTemplesProps {
  temples: TempleSummary[];
  currentSlug: string;
}

export default function NearbyTemples({ temples, currentSlug }: NearbyTemplesProps) {
  const nearby = temples.filter((t) => t.slug !== currentSlug).slice(0, 4);

  if (nearby.length === 0) return null;

  return (
    <section className="section-wrapper py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <span className="block font-body text-xs text-gold uppercase tracking-widest mb-2">
            Same Province
          </span>
          <h2 className="font-heading text-2xl md:text-3xl text-charcoal">
            Nearby Temples
          </h2>
        </div>
        <Link
          href="/temples"
          className="hidden sm:inline-flex items-center gap-1 font-body text-sm text-jungle hover:underline"
        >
          View all
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {nearby.map((temple) => (
          <Link
            key={temple.id}
            href={`/temples/${temple.slug}`}
            className="group block rounded-xl overflow-hidden bg-white border border-charcoal/8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
          >
            {/* Image */}
            <div className="relative h-44 overflow-hidden bg-charcoal/5">
              <Image
                src={temple.featuredImage || `https://picsum.photos/seed/${temple.slug}/480/320`}
                alt={temple.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-106 transition-transform duration-500"
                unoptimized
              />
              {temple.era && (
                <span className="absolute top-3 left-3 font-body text-[10px] uppercase tracking-wider bg-charcoal/60 text-sandstone px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {temple.era.name}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-heading text-sm font-semibold text-charcoal line-clamp-1 mb-0.5 group-hover:text-jungle transition-colors duration-200">
                {temple.name}
              </h3>
              {temple.khmerName && (
                <p className="font-body text-xs text-charcoal/40 mb-2 line-clamp-1">
                  {temple.khmerName}
                </p>
              )}
              <div className="flex items-center gap-1 text-charcoal/40">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-body text-[11px]">{temple.province.name}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
