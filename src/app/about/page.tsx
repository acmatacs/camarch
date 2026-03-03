import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About — CamArch",
  description: "Learn about the CamArch project — a platform dedicated to documenting and celebrating Cambodia's extraordinary Khmer temple heritage.",
};

const timeline = [
  { year: "9th c.", label: "Khmer Empire founded", note: "Jayavarman II establishes the Khmer state at Phnom Kulen" },
  { year: "889", label: "Bakong completed", note: "First major sandstone temple-mountain of the Angkor era" },
  { year: "c. 1122", label: "Angkor Wat constructed", note: "Suryavarman II builds the world's largest religious monument" },
  { year: "1181", label: "Jayavarman VII's reign begins", note: "The Bayon and Ta Prohm are commissioned under Buddhist rule" },
  { year: "1431", label: "Angkor abandoned", note: "Capital moves south; temples are reclaimed by the jungle" },
  { year: "1860", label: "Henri Mouhot 'rediscovers'", note: "French naturalist brings Angkor Wat to Western attention" },
  { year: "1907", label: "EFEO conservation begins", note: "École française d'Extrême-Orient begins systematic restoration" },
  { year: "1992", label: "UNESCO World Heritage", note: "Angkor is inscribed on the World Heritage List" },
];


export default function AboutPage() {
  return (
    <div className="bg-sandstone min-h-screen">
      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <div
        className="relative py-28 md:py-40 bg-charcoal overflow-hidden"
        style={{
          backgroundImage: "url(https://upload.wikimedia.org/wikipedia/commons/f/f5/Buddhist_monks_in_front_of_the_Angkor_Wat.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 60%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 to-charcoal/90" />
        <div className="relative z-10 section-wrapper text-center">
          <span className="block font-body text-xs text-gold uppercase tracking-widest mb-4">
            Our Mission
          </span>
          <h1 className="font-heading text-4xl md:text-6xl text-white mb-6 max-w-3xl mx-auto leading-tight">
            Preserving Cambodia's Ancient Legacy
          </h1>
          <p className="font-body text-lg text-sandstone/70 max-w-2xl mx-auto leading-relaxed">
            CamArch is a digital platform dedicated to cataloguing, celebrating, and sharing
            the extraordinary architectural heritage of the Khmer Empire — one temple at a time.
          </p>
        </div>
      </div>

      {/* ─── Developer Profile ───────────────────────────────────────────── */}
      <section className="bg-white border-b border-charcoal/8">
        <div className="section-wrapper py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-8">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-charcoal/10 shadow-md shrink-0">
              <Image
                src="/acmatac.jpg"
                alt="Acmatac Seing"
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-heading text-2xl text-charcoal mb-1">Acmatac Seing</p>
              <p className="font-body text-sm text-charcoal/50">
                Designed &amp; developed by Acmatac Seing in collaboration with AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Mission ─────────────────────────────────────────────────────── */}
      <section className="section-wrapper py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              icon: "🗺️",
              title: "Document",
              body: "We systematically catalogue every known temple site across Cambodia — recording architectural styles, historical context, and GPS coordinates.",
            },
            {
              icon: "🔍",
              title: "Discover",
              body: "Our advanced search and interactive map help researchers, travellers, and enthusiasts find and explore temples by style, era, religion, and location.",
            },
            {
              icon: "🌿",
              title: "Preserve",
              body: "By raising awareness of lesser-known sites we support conservation efforts and ensure these irreplaceable monuments are not forgotten.",
            },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="font-heading text-xl text-charcoal mb-3">{item.title}</h3>
              <p className="font-body text-charcoal/60 leading-relaxed text-sm">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Divider ─────────────────────────────────────────────────────── */}
      <div className="border-t border-charcoal/8" />

      {/* ─── Timeline ───────────────────────────────────────────────────── */}
      <section className="section-wrapper py-20">
        <div className="max-w-2xl mx-auto">
          <span className="block font-body text-xs text-gold uppercase tracking-widest text-center mb-3">
            History
          </span>
          <h2 className="font-heading text-3xl md:text-4xl text-charcoal text-center mb-14">
            A Thousand Years of Stone
          </h2>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[calc(6rem)] top-0 bottom-0 w-px bg-charcoal/10 hidden sm:block" />

            <div className="space-y-8">
              {timeline.map((item, i) => (
                <div key={i} className="flex items-start gap-6">
                  <div className="shrink-0 w-24 text-right">
                    <span className="font-heading text-sm text-gold">{item.year}</span>
                  </div>
                  {/* Dot */}
                  <div className="hidden sm:flex shrink-0 items-center justify-center w-3 h-3 mt-1 rounded-full border-2 border-gold bg-sandstone z-10" />
                  <div className="flex-1 pb-2">
                    <p className="font-heading text-sm text-charcoal font-semibold mb-0.5">
                      {item.label}
                    </p>
                    <p className="font-body text-xs text-charcoal/50">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Divider ─────────────────────────────────────────────────────── */}
      <div className="border-t border-charcoal/8 bg-charcoal/2">
        {/* Stats */}
        <div className="section-wrapper py-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: "1,000+", label: "Years of history" },
            { num: "20", label: "Temples catalogued" },
            { num: "4", label: "Provinces covered" },
            { num: "9", label: "Architectural styles" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-heading text-3xl md:text-4xl text-gold mb-1">{s.num}</p>
              <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── CTA ─────────────────────────────────────────────────────────── */}
      <div className="bg-charcoal py-20">
        <div className="section-wrapper text-center">
          <h2 className="font-heading text-3xl md:text-4xl text-white mb-4">
            Start Exploring
          </h2>
          <p className="font-body text-sandstone/60 mb-8 max-w-md mx-auto">
            Browse our growing catalogue of Cambodian temples or explore them geographically on our interactive map.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/temples" className="btn-gold">
              Browse Temples
            </Link>
            <Link href="/map" className="btn-outline border-white/30 text-sandstone hover:bg-white/10">
              Open Map
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
