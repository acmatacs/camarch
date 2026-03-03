"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/temples", label: "Temples" },
];

const refItems = [
  { href: "/admin/provinces", label: "Provinces" },
  { href: "/admin/kings", label: "Kings" },
  { href: "/admin/styles", label: "Styles" },
  { href: "/admin/eras", label: "Eras" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-charcoal/4 flex flex-col">
      {/* Admin top bar */}
      <header className="bg-charcoal text-sandstone px-6 py-3 flex items-center justify-between shrink-0 shadow-md z-20">
        <div className="flex items-center gap-4">
          <span className="font-heading text-gold text-lg tracking-wide">CamArch</span>
          <span className="text-sandstone/20 text-xs">|</span>
          <span className="font-body text-xs text-sandstone/50 uppercase tracking-widest">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="font-body text-xs text-sandstone/50 hover:text-sandstone transition-colors flex items-center gap-1">
            ← View Site
          </Link>
          <button
            onClick={handleLogout}
            className="font-body text-xs text-sandstone/70 hover:text-red-400 transition-colors flex items-center gap-1"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-48 shrink-0 bg-white border-r border-charcoal/8 shadow-sm hidden md:flex md:flex-col">
          <nav className="p-4 space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-body text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-jungle text-white font-medium"
                      : "text-charcoal/60 hover:bg-charcoal/5 hover:text-charcoal"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-white" : "bg-charcoal/20"}`} />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-3 pb-1">
              <p className="px-3 font-body text-[9px] uppercase tracking-widest text-charcoal/30">Reference Data</p>
            </div>
            {refItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-body text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-jungle text-white font-medium"
                      : "text-charcoal/60 hover:bg-charcoal/5 hover:text-charcoal"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-white" : "bg-charcoal/20"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-charcoal/8">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg font-body text-sm text-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-150 border border-red-100 hover:border-red-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden bg-white border-b border-charcoal/8 flex gap-1 px-4 py-2 overflow-x-auto">
          {[...navItems, ...refItems].map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg font-body text-xs transition-all duration-150 whitespace-nowrap ${
                  isActive ? "bg-jungle text-white" : "text-charcoal/60 hover:bg-charcoal/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
