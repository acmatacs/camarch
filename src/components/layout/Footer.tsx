import Link from "next/link";

const footerLinks = {
  Explore: [
    { href: "/temples", label: "All Temples" },
    { href: "/map", label: "Interactive Map" },
    { href: "/temples?era=Angkorian", label: "Angkorian Era" },
    { href: "/temples?era=Pre-Angkorian", label: "Pre-Angkorian Era" },
  ],
  Regions: [
    { href: "/temples?province=Siem+Reap", label: "Siem Reap" },
    { href: "/temples?province=Preah+Vihear", label: "Preah Vihear" },
    { href: "/temples?province=Kampong+Thom", label: "Kampong Thom" },
    { href: "/temples?province=Banteay+Meanchey", label: "Banteay Meanchey" },
  ],
  Platform: [
    { href: "/about", label: "About CamArch" },
    { href: "/admin", label: "CMS Dashboard" },
    { href: "/admin/temples/new", label: "Add a Temple" },
  ],
};

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.745 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1C1E] text-sandstone/70">
      {/* ─── Main Footer Content ─── */}
      <div className="section-wrapper py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-1 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <svg
                className="w-8 h-8 text-gold flex-shrink-0"
                viewBox="0 0 40 40"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M20 36c-1.5-4-5-8-10-9 3-1 6-4 8-8 1 3 4 7 8 8-5 1-9 5-6 9z"
                  fill="currentColor"
                  opacity="0.9"
                />
                <path
                  d="M20 36c1.5-4 5-8 10-9-3-1-6-4-8-8-1 3-4 7-8 8 5 1 9 5 6 9z"
                  fill="currentColor"
                  opacity="0.7"
                />
                <path
                  d="M20 12c0-4-2-8-5-10 0 3-1 6-3 8 2 0 6 1 8 2z"
                  fill="currentColor"
                />
                <path
                  d="M20 12c0-4 2-8 5-10 0 3 1 6 3 8-2 0-6 1-8 2z"
                  fill="currentColor"
                  opacity="0.8"
                />
                <circle cx="20" cy="20" r="4" fill="currentColor" />
              </svg>
              <div className="leading-tight">
                <span className="font-heading text-lg font-semibold text-sandstone tracking-wider">
                  CAMARCH
                </span>
                <span className="block text-[9px] font-body text-gold/80 tracking-[0.2em] uppercase -mt-0.5">
                  Cambodian Archaeology
                </span>
              </div>
            </Link>
            <p className="font-body text-sm leading-relaxed mb-6 max-w-sm">
              An open platform dedicated to documenting, preserving, and sharing
              the rich archaeological heritage of Cambodia — from the grandeur
              of Angkor Wat to remote jungle sanctuaries.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-sandstone/5 text-sandstone/50 hover:bg-gold/20 hover:text-gold transition-colors duration-200"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-heading text-xs font-semibold text-sandstone/40 uppercase tracking-[0.15em] mb-5">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-sandstone/60 hover:text-gold transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Bottom Bar ─── */}
      <div className="border-t border-sandstone/10">
        <div className="section-wrapper py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-sandstone/40">
            © {currentYear} CamArch. Built with Next.js, Prisma & Supabase.
          </p>
          <div className="flex items-center gap-1 font-body text-xs text-sandstone/40">
            <span>Made with</span>
            <span className="text-gold">♥</span>
            <span>for Cambodian heritage preservation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
