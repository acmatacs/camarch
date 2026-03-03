"use client";

import { useState, useRef, useCallback } from "react";
import TempleCard from "@/components/ui/TempleCard";
import type { TempleSummary } from "@/types";
import Link from "next/link";

interface FeaturedCarouselProps {
  temples: TempleSummary[];
}

export default function FeaturedCarousel({ temples }: FeaturedCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const visibleCount = 3; // cards visible at once on desktop
  const maxIndex = Math.max(0, temples.length - visibleCount);

  const scrollTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(maxIndex, index));
    setActiveIndex(clamped);
  }, [maxIndex]);

  const prev = () => scrollTo(activeIndex - 1);
  const next = () => scrollTo(activeIndex + 1);

  return (
    <section className="py-24 bg-white">
      <div className="section-wrapper">
        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="font-body text-xs text-gold tracking-[0.25em] uppercase font-medium">
              Editor&apos;s Picks
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal mt-3">
              Featured
              <span className="text-jungle"> Temples</span>
            </h2>
          </div>

          {/* Navigation arrows + view all */}
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              disabled={activeIndex === 0}
              className="w-10 h-10 rounded-full border-2 border-charcoal/15 flex items-center justify-center text-charcoal/50 hover:border-jungle hover:text-jungle disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Previous"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              disabled={activeIndex >= maxIndex}
              className="w-10 h-10 rounded-full border-2 border-charcoal/15 flex items-center justify-center text-charcoal/50 hover:border-jungle hover:text-jungle disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Next"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <Link
              href="/temples"
              className="hidden sm:inline-flex btn-outline text-xs !px-5 !py-2.5"
            >
              View All
            </Link>
          </div>
        </div>

        {/* ─── Carousel Track ─── */}
        <div className="overflow-hidden -mx-2" ref={trackRef}>
          <div
            className="flex gap-0 transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(calc(-${activeIndex} * (100% / ${visibleCount})))`,
            }}
          >
            {temples.map((temple) => (
              <div
                key={temple.id}
                className="flex-shrink-0 px-2"
                style={{ width: `calc(100% / ${visibleCount})` }}
              >
                <TempleCard temple={temple} className="h-full" />
              </div>
            ))}
          </div>
        </div>

        {/* ─── Dot indicators ─── */}
        {temples.length > visibleCount && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === activeIndex
                    ? "bg-jungle w-6 h-2"
                    : "bg-charcoal/20 w-2 h-2 hover:bg-charcoal/40"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* ─── Mobile CTA ─── */}
        <div className="sm:hidden mt-8 text-center">
          <Link href="/temples" className="btn-outline">
            View All Temples
          </Link>
        </div>
      </div>
    </section>
  );
}
