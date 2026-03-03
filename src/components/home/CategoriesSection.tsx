import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    title: "Angkor Archaeological Park",
    description:
      "The crown jewel of Khmer civilisation, spanning over 400 km² near Siem Reap.",
    href: "/temples?province=Siem+Reap",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Buddhist_monks_in_front_of_the_Angkor_Wat.jpg/1280px-Buddhist_monks_in_front_of_the_Angkor_Wat.jpg",
    count: "100+ temples",
    badge: "UNESCO",
    color: "from-jungle/80",
  },
  {
    title: "Remote Jungle Temples",
    description:
      "Forgotten sanctuaries swallowed by centuries of jungle growth, waiting to be rediscovered.",
    href: "/temples?province=Preah+Vihear",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Ta_Prohm_%28III%29.jpg",
    count: "40+ sites",
    badge: "Off-the-beaten-path",
    color: "from-[#1A1C1E]/80",
  },
  {
    title: "Angkorian Era",
    description:
      "Monuments of the Khmer golden age — the 9th to 15th century empire at its zenith.",
    href: "/temples?era=Angkorian",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Bayon%2C_Angkor_Thom%2C_Camboya%2C_2013-08-17%2C_DD_37.JPG",
    count: "9th–15th century",
    badge: "Angkorian",
    color: "from-[#3a2500]/80",
  },
  {
    title: "Hindu Temples",
    description:
      "Dedicated to Shiva, Vishnu, and the Hindu cosmos — the spiritual roots of Khmer sovereignty.",
    href: "/temples?religion=Hindu",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Banteay_Srei_full2.jpg/1280px-Banteay_Srei_full2.jpg",
    count: "50+ temples",
    badge: "Hindu",
    color: "from-[#4a1e00]/80",
  },
  {
    title: "Buddhist Monuments",
    description:
      "Serene sanctuaries where Buddhism gradually transformed the great stone temples of Angkor.",
    href: "/temples?religion=Buddhist",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Neakpeancentralpond2014.jpg/1280px-Neakpeancentralpond2014.jpg",
    count: "30+ temples",
    badge: "Buddhist",
    color: "from-jungle/80",
  },
  {
    title: "UNESCO World Heritage",
    description:
      "Internationally recognised sites of outstanding universal value to humanity.",
    href: "/temples?search=UNESCO",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/03_Prasat_Preah_Vihear-nX-06532.jpg/1280px-03_Prasat_Preah_Vihear-nX-06532.jpg",
    count: "3 sites",
    badge: "Heritage",
    color: "from-[#1A1C1E]/80",
  },
];

export default function CategoriesSection() {
  return (
    <section className="py-24 bg-sandstone">
      <div className="section-wrapper">
        {/* ─── Heading ─── */}
        <div className="text-center mb-14">
          <span className="font-body text-xs text-gold tracking-[0.25em] uppercase font-medium">
            Browse by Category
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal mt-3 mb-4">
            Explore the
            <span className="text-jungle"> Khmer World</span>
          </h2>
          <p className="font-body text-base text-charcoal/60 max-w-xl mx-auto leading-relaxed">
            From world-renowned UNESCO sites to remote jungle sanctuaries — filter
            temples by era, religion, location, and more.
          </p>
        </div>

        {/* ─── Category Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group relative overflow-hidden rounded-xl aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Background Image */}
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent`}
              />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                {/* Badge */}
                <span className="self-start badge bg-gold/90 text-white text-[10px] tracking-wider mb-3">
                  {cat.badge}
                </span>

                <h3 className="font-heading text-lg sm:text-xl font-semibold text-white mb-1.5 leading-snug">
                  {cat.title}
                </h3>
                <p className="font-body text-xs text-white/70 leading-relaxed mb-3 line-clamp-2">
                  {cat.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-white/50">{cat.count}</span>
                  <span className="flex items-center gap-1 font-body text-xs text-gold group-hover:gap-2 transition-all duration-200">
                    Explore
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
