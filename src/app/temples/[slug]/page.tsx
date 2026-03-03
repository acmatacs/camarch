import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { TempleDetail, TempleSummary } from "@/types";
import ImageGallery from "@/components/temples/ImageGallery";
import QuickFactsPanel from "@/components/temples/QuickFactsPanel";
import NearbyTemples from "@/components/temples/NearbyTemples";
import Link from "next/link";

// ─── Static params for build-time SSG ─────────────────────────────────────────
export async function generateStaticParams() {
  const temples = await prisma.temple.findMany({ select: { slug: true } });
  return temples.map((t: { slug: string }) => ({ slug: t.slug }));
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const temple = await prisma.temple.findUnique({
    where: { slug },
    select: { name: true, description: true, featuredImage: true, khmerName: true },
  });
  if (!temple) return { title: "Temple Not Found" };

  return {
    title: `${temple.name} — CamArch`,
    description: temple.description?.slice(0, 160) ?? `Learn about ${temple.name}, one of Cambodia's iconic Khmer temples.`,
    openGraph: {
      title: temple.name,
      description: temple.description?.slice(0, 160) ?? "",
      images: temple.featuredImage ? [{ url: temple.featuredImage }] : [],
    },
  };
}

// ─── Data fetching ────────────────────────────────────────────────────────────
async function getTemple(slug: string): Promise<TempleDetail | null> {
  const raw = await prisma.temple.findUnique({
    where: { slug },
    include: { province: true, king: true, style: true, era: true },
  });
  if (!raw) return null;

  return {
    ...raw,
    galleryImages: raw.galleryImages ?? [],
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  } as unknown as TempleDetail;
}

async function getNearbyTemples(provinceId: number, currentSlug: string): Promise<TempleSummary[]> {
  const raws = await prisma.temple.findMany({
    where: { provinceId, NOT: { slug: currentSlug } },
    take: 4,
    include: { province: true, era: true, style: true, king: true },
  });

  return raws.map((t: Record<string, unknown>) => ({
    ...t,
    galleryImages: undefined,
    createdAt: undefined,
    updatedAt: undefined,
  })) as unknown as TempleSummary[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function TempleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [temple, nearbyRaw] = await Promise.all([
    getTemple(slug),
    prisma.temple
      .findUnique({ where: { slug }, select: { provinceId: true } })
      .then((t: { provinceId: number } | null) => (t ? getNearbyTemples(t.provinceId, slug) : [])),
  ]);

  if (!temple) notFound();

  const galleryImages = temple.galleryImages ?? [];

  return (
    <div className="bg-sandstone min-h-screen">
      {/* ─── Hero banner ────────────────────────────────────────────────── */}
      <div
        className="relative h-72 md:h-96 bg-charcoal overflow-hidden"
        style={{
          backgroundImage: `url(${temple.featuredImage || `https://picsum.photos/seed/${slug}/1920/768`})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/50 via-charcoal/30 to-charcoal/80" />
        <div className="relative z-10 section-wrapper h-full flex flex-col justify-end pb-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 font-body text-xs text-sandstone/60 mb-4">
            <Link href="/" className="hover:text-sandstone transition-colors">Home</Link>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            <Link href="/temples" className="hover:text-sandstone transition-colors">Temples</Link>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            <span className="text-sandstone/90 line-clamp-1">{temple.name}</span>
          </nav>

          <h1 className="font-heading text-3xl md:text-5xl text-white drop-shadow-md">
            {temple.name}
          </h1>
          {temple.khmerName && (
            <p className="font-body text-lg text-sandstone/70 mt-1 tracking-wide">
              {temple.khmerName}
            </p>
          )}

          {/* Tag pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {temple.religion && (
              <span className="badge bg-white/15 text-white backdrop-blur-sm">
                {temple.religion}
              </span>
            )}
            {temple.yearBuilt && (
              <span className="badge bg-white/15 text-white backdrop-blur-sm">
                c. {temple.yearBuilt} CE
              </span>
            )}
            {temple.style && (
              <span className="badge bg-gold/80 text-white">
                {temple.style.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Main content ────────────────────────────────────────────────── */}
      <div className="section-wrapper py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">

          {/* Left column — gallery + description */}
          <div className="lg:col-span-2 space-y-8">

            {/* Gallery */}
            <ImageGallery
              featuredImage={temple.featuredImage || `https://picsum.photos/seed/${slug}/1280/720`}
              galleryImages={galleryImages}
              templeName={temple.name}
            />

            {/* Description */}
            <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm p-7 space-y-6">
              <div>
                <span className="block font-body text-xs text-gold uppercase tracking-widest mb-2">About</span>
                <h2 className="font-heading text-2xl text-charcoal mb-4">Overview</h2>
                <p className="font-body text-base text-charcoal/70 leading-relaxed">
                  {temple.description}
                </p>
              </div>

              {temple.history && (
                <div className="pt-6 border-t border-charcoal/8">
                  <span className="block font-body text-xs text-gold uppercase tracking-widest mb-2">History</span>
                  <h2 className="font-heading text-2xl text-charcoal mb-4">Historical Background</h2>
                  <p className="font-body text-base text-charcoal/70 leading-relaxed whitespace-pre-line">
                    {temple.history}
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Right column — quick facts sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <QuickFactsPanel temple={temple} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Nearby temples ───────────────────────────────────────────────── */}
      {nearbyRaw.length > 0 && (
        <div className="border-t border-charcoal/8 bg-white">
          <NearbyTemples temples={nearbyRaw} currentSlug={slug} />
        </div>
      )}
    </div>
  );
}
