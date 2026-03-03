import Link from "next/link";
import Image from "next/image";

export default function MapCallout() {
  return (
    <section className="py-24 bg-sandstone">
      <div className="section-wrapper">
        <div className="relative overflow-hidden rounded-2xl bg-[#1A1C1E] shadow-2xl">
          {/* Background image */}
          <div className="absolute inset-0 z-0 opacity-20">
            <Image
              src="https://picsum.photos/seed/koh-ker-map/1280/720"
              alt="Map background"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-jungle/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-gold/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 p-10 sm:p-14 lg:p-16">
            {/* ─── Left: Copy ─── */}
            <div className="flex-1 text-center lg:text-left">
              <span className="font-body text-xs text-gold tracking-[0.25em] uppercase font-medium mb-4 block">
                Interactive Map
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
                Discover Temples
                <br />
                <span className="text-gold">Across Cambodia</span>
              </h2>
              <p className="font-body text-base text-white/60 leading-relaxed max-w-lg mb-8 mx-auto lg:mx-0">
                Explore an interactive full-screen map powered by OpenStreetMap.
                Zoom into any region, click a temple pin to see a preview, and
                navigate directly to its full detail page.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link href="/map" className="btn-gold !px-8 !py-3.5 text-sm">
                  Open Map View
                </Link>
                <Link
                  href="/temples"
                  className="btn-outline !border-white/20 !text-white/70 hover:!bg-white/10 hover:!text-white !px-8 !py-3.5 text-sm"
                >
                  Browse All Temples
                </Link>
              </div>
            </div>

            {/* ─── Right: Map Preview Card ─── */}
            <div className="flex-shrink-0 w-full lg:w-80">
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-center">
                {/* Fake mini map icon */}
                <div className="relative mx-auto mb-4 w-20 h-20 rounded-full bg-jungle/30 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </div>
                <h3 className="font-heading text-white text-lg font-semibold mb-2">
                  Temple Map
                </h3>
                <p className="font-body text-white/50 text-sm mb-4">
                  All Cambodian temples plotted on an interactive OpenStreetMap
                  canvas with clustering.
                </p>
                <div className="grid grid-cols-2 gap-3 text-center">
                  {[
                    { value: "25", label: "Provinces" },
                    { value: "∞", label: "Zoom Levels" },
                    { value: "Free", label: "OSM Tiles" },
                    { value: "Live", label: "Data" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg bg-white/5 border border-white/10 py-2.5"
                    >
                      <div className="font-heading text-base font-bold text-gold">
                        {stat.value}
                      </div>
                      <div className="font-body text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
