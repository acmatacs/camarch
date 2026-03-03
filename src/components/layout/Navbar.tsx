"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/temples", label: "Temples" },
  { href: "/map", label: "Map" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHome || isMobileOpen
          ? "bg-[#1A1C1E]/95 backdrop-blur-sm shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="section-wrapper">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* ─── Logo ─── */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            {/* Lotus icon */}
            <svg
              className="w-8 h-8 text-gold"
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

          {/* ─── Desktop Nav Links ─── */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative px-4 py-2 font-body text-sm font-medium tracking-wide transition-colors duration-200 rounded-md
                      ${
                        isActive
                          ? "text-gold"
                          : "text-sandstone/80 hover:text-sandstone"
                      }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-gold rounded-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ─── Desktop CTA ─── */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/admin"
              className="btn-outline !border-sandstone/30 !text-sandstone/70 text-xs !px-4 !py-2 hover:!bg-sandstone/10 hover:!text-sandstone hover:!border-sandstone/60"
            >
              CMS Admin
            </Link>
            <Link href="/temples" className="btn-gold text-xs !px-5 !py-2">
              Explore Temples
            </Link>
          </div>

          {/* ─── Mobile Menu Toggle ─── */}
          <button
            onClick={() => setIsMobileOpen((v) => !v)}
            className="md:hidden flex flex-col gap-[5px] p-2 rounded-md group"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={`block h-[2px] w-6 bg-sandstone rounded transition-all duration-300 ${
                isMobileOpen ? "rotate-45 translate-y-[7px]" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-6 bg-sandstone rounded transition-all duration-300 ${
                isMobileOpen ? "opacity-0 w-0" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-6 bg-sandstone rounded transition-all duration-300 ${
                isMobileOpen ? "-rotate-45 -translate-y-[7px]" : ""
              }`}
            />
          </button>
        </nav>

        {/* ─── Mobile Dropdown ─── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMobileOpen ? "max-h-96 pb-6" : "max-h-0"
          }`}
        >
          <ul className="flex flex-col gap-1 pt-2 border-t border-sandstone/10">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "text-gold bg-gold/10"
                        : "text-sandstone/80 hover:text-sandstone hover:bg-sandstone/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="mt-3 flex flex-col gap-2">
              <Link href="/admin" className="btn-outline w-full text-center !border-sandstone/30 !text-sandstone/70 !py-2">
                CMS Admin
              </Link>
              <Link href="/temples" className="btn-gold w-full text-center !py-2">
                Explore Temples
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
