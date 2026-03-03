"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/temples?search=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ─── Background Image ─── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://picsum.photos/seed/angkor-wat-hero/1920/1080"
          alt="Angkor Wat at sunrise"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Multi-layer gradient for depth & readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1C1E]/70 via-[#1A1C1E]/40 to-[#1A1C1E]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1C1E]/30 via-transparent to-[#1A1C1E]/30" />
      </div>

      {/* ─── Decorative bottom wave ─── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 80L60 72C120 64 240 48 360 45.3C480 42.7 600 53.3 720 56C840 58.7 960 53.3 1080 48C1200 42.7 1320 37.3 1380 34.7L1440 32V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
            fill="#F7F5F0"
          />
        </svg>
      </div>

      {/* ─── Hero Content ─── */}
      <div className="relative z-10 section-wrapper text-center py-32 pt-40">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-[1px] w-12 sm:w-20 bg-gold/50" />
          <span className="font-body text-xs sm:text-sm text-gold/90 tracking-[0.3em] uppercase">
            Discover · Explore · Preserve
          </span>
          <div className="h-[1px] w-12 sm:w-20 bg-gold/50" />
        </div>

        {/* Headline */}
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.15] mb-6 drop-shadow-2xl">
          Ancient Temples of
          <br />
          <span className="text-gold">Cambodia</span>
        </h1>

        {/* Sub-headline */}
        <p className="font-body text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          Explore over a thousand years of Khmer civilisation — from the
          world&apos;s largest religious monument to hidden jungle sanctuaries
          waiting to be discovered.
        </p>

        {/* ─── Search Bar ─── */}
        <form
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto flex flex-col sm:flex-row items-stretch gap-3"
        >
          <div className="relative flex-1">
            {/* Search icon */}
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search temples, e.g. Angkor Wat, Bayon…"
              className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/95 backdrop-blur-sm text-charcoal font-body text-sm placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-gold/60 shadow-xl"
            />
          </div>
          <button
            type="submit"
            className="btn-gold h-14 !rounded-xl !px-8 text-sm font-semibold shadow-xl shrink-0"
          >
            Search
          </button>
        </form>

        {/* Quick links */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="font-body text-xs text-white/50">Popular:</span>
          {["Angkor Wat", "Bayon", "Ta Prohm", "Banteay Srei", "Koh Ker"].map((term) => (
            <button
              key={term}
              onClick={() =>
                router.push(`/temples?search=${encodeURIComponent(term)}`)
              }
              className="font-body text-xs text-white/70 hover:text-gold px-3 py-1.5 rounded-full border border-white/15 hover:border-gold/40 transition-all duration-200 bg-white/5 hover:bg-white/10 backdrop-blur-sm"
            >
              {term}
            </button>
          ))}
        </div>

        {/* ─── Stats ─── */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-16">
          {[
            { value: "1,000+", label: "Years of History" },
            { value: "25", label: "Provinces" },
            { value: "100+", label: "Temple Sites" },
            { value: "3", label: "UNESCO Sites" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-heading text-2xl sm:text-3xl font-bold text-gold mb-1 drop-shadow-lg">
                {stat.value}
              </div>
              <div className="font-body text-xs text-white/50 uppercase tracking-[0.15em]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Scroll indicator ─── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <svg
          className="w-6 h-6 text-white/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </section>
  );
}
