import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import MapCallout from "@/components/home/MapCallout";
import { prisma } from "@/lib/prisma";
import type { TempleSummary } from "@/types";

async function getFeaturedTemples(): Promise<TempleSummary[]> {
  try {
    const rows = await prisma.temple.findMany({
      take: 6,
      orderBy: { name: "asc" },
      include: {
        province: { select: { id: true, name: true } },
        era: { select: { id: true, name: true } },
        style: { select: { id: true, name: true } },
        king: { select: { id: true, name: true } },
      },
    });
    return rows as unknown as TempleSummary[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredTemples = await getFeaturedTemples();

  return (
    <>
      <HeroSection />
      <CategoriesSection />
      {featuredTemples.length > 0 ? (
        <FeaturedCarousel temples={featuredTemples} />
      ) : (
        <FeaturedPlaceholder />
      )}
      <MapCallout />
    </>
  );
}

function FeaturedPlaceholder() {
  return (
    <section className="py-24 bg-white">
      <div className="section-wrapper text-center">
        <span className="font-body text-xs text-gold tracking-[0.25em] uppercase font-medium">
          Editor&apos;s Picks
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-charcoal mt-3 mb-4">
          Featured <span className="text-jungle">Temples</span>
        </h2>
        <p className="font-body text-sm text-charcoal/50 max-w-md mx-auto mb-8">
          Connect your Supabase database and run{" "}
          <code className="bg-charcoal/5 px-1.5 py-0.5 rounded text-charcoal/70 font-mono">
            npx prisma db seed
          </code>{" "}
          to populate featured temples here.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg overflow-hidden shadow-md animate-pulse">
              <div className="bg-charcoal/10 aspect-[16/10]" />
              <div className="p-5 space-y-3 bg-white">
                <div className="h-3 bg-charcoal/8 rounded w-1/3" />
                <div className="h-5 bg-charcoal/10 rounded w-3/4" />
                <div className="h-3 bg-charcoal/6 rounded w-1/2" />
                <div className="flex gap-2 pt-2">
                  <div className="h-5 w-16 bg-charcoal/6 rounded-full" />
                  <div className="h-5 w-12 bg-charcoal/6 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


