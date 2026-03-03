import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { MapTemple } from "@/types";
import TempleMapClient from "@/components/map/TempleMapClient";

export const metadata: Metadata = {
  title: "Interactive Map — CamArch",
  description: "Explore Cambodian temples on an interactive map. Discover Angkor Wat, Bayon, Ta Prohm and more across the Khmer Empire's heartland.",
};

// TempleMapClient handles the dynamic import with ssr:false internally

async function getMapTemples(): Promise<MapTemple[]> {
  const rows = await prisma.temple.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      khmerName: true,
      latitude: true,
      longitude: true,
      featuredImage: true,
      yearBuilt: true,
      religion: true,
      province: { select: { name: true } },
      era: { select: { name: true } },
      style: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });
  return rows as unknown as MapTemple[];
}

export default async function MapPage() {
  const temples = await getMapTemples();

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* ─── Top bar ─────────────────────────────────────────────────────── */}
      <div className="bg-charcoal text-sandstone px-5 py-3 flex items-center justify-between shrink-0 border-b border-white/8">
        <div>
          <h1 className="font-heading text-lg text-white leading-tight">
            Temple Map
          </h1>
          <p className="font-body text-xs text-sandstone/50 mt-0.5">
            {temples.length} temples · click a pin to explore
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-1.5 font-body text-xs text-sandstone/60">
            <span className="inline-block w-3 h-3 rounded-full bg-gold" />
            Temple site
          </div>
        </div>
      </div>

      {/* ─── Map fills remaining height ────────────────────────────────── */}
      <div className="flex-1 relative">
        <TempleMapClient temples={temples} />
      </div>
    </div>
  );
}
