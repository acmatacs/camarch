"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

// ── Nav structure ──────────────────────────────────────────────────────────────
const sections = [
  {
    group: null,
    items: [
      { href: "/admin",            label: "Dashboard",   permission: undefined,        icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
      { href: "/admin/temples",    label: "Temples",      permission: "temples:read",   icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
      { href: "/admin/files",      label: "Files",        permission: "temples:read",   icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
    ],
  },
  {
    group: "Administration",
    items: [
      { href: "/admin/users",      label: "Users",        permission: "users:manage",   icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
      { href: "/admin/roles",      label: "Roles",        permission: "roles:manage",   icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
      { href: "/admin/audit-logs", label: "Audit Logs",   permission: "audit:read",     icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
    ],
  },
  {
    group: "Reference Data",
    items: [
      { href: "/admin/provinces", label: "Provinces", permission: "temples:write", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
      { href: "/admin/kings",     label: "Kings",     permission: "temples:write", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
      { href: "/admin/styles",    label: "Styles",    permission: "temples:write", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" },
      { href: "/admin/eras",      label: "Eras",      permission: "temples:write", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [permissions, setPermissions] = useState<string[] | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (pathname === "/admin/login") return;
    fetch("/api/admin/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setPermissions(d.data?.permissions ?? []);
        setUserName(d.data?.name ?? d.data?.email ?? null);
        setUserRole(d.data?.roleName ?? null);
      })
      .catch(() => setPermissions([]));
  }, [pathname]);

  const can = (permission: string | undefined) => {
    if (!permission) return true;
    if (permissions === null) return true; // optimistic — hide flash; server guards enforce real access
    return permissions.includes(permission);
  };

  const initials = userName
    ? userName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  // Filtered sections for sidebar search
  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sections.map((sec) => ({
      ...sec,
      items: sec.items.filter(
        (item) => can(item.permission) && (!q || item.label.toLowerCase().includes(q))
      ),
    })).filter((sec) => sec.items.length > 0);
  }, [search, permissions]); // eslint-disable-line react-hooks/exhaustive-deps

  // Login page renders standalone — no shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f3f3]">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="bg-charcoal text-sandstone px-5 py-0 flex items-center justify-between shrink-0 shadow-md z-20 h-12">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="font-heading text-gold text-base tracking-wide leading-none">CamArch</Link>
          <span className="text-sandstone/20 text-[10px]">|</span>
          <span className="font-body text-[11px] text-sandstone/50 uppercase tracking-widest">Setup</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/" className="font-body text-[11px] text-sandstone/50 hover:text-sandstone transition-colors">
            ← View Site
          </Link>
          <button
            onClick={handleLogout}
            className="font-body text-[11px] text-sandstone/60 hover:text-red-400 transition-colors"
          >
            Sign Out
          </button>
          {/* User avatar */}
          <div className="w-7 h-7 rounded-full bg-gold/80 flex items-center justify-center text-charcoal font-body text-[10px] font-bold uppercase select-none" title={userName ?? ""}>
            {initials}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <aside className="w-56 shrink-0 bg-white border-r border-gray-200 hidden md:flex md:flex-col overflow-y-auto">

          {/* Search */}
          <div className="px-3 pt-4 pb-2">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Setup…"
                className="w-full pl-8 pr-3 py-1.5 text-xs font-body border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-jungle/40 focus:border-jungle/40 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Nav sections */}
          <nav className="flex-1 py-2">
            {filteredSections.map((sec) => (
              <div key={sec.group ?? "__main"} className="mb-1">
                {sec.group && (
                  <p className="px-4 pt-4 pb-1 font-body text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                    {sec.group}
                  </p>
                )}
                {sec.items.map((item) => {
                  const isActive = item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-3 px-4 py-2 text-sm font-body transition-colors duration-100 border-l-[3px] ${
                        isActive
                          ? "border-jungle bg-jungle/5 text-jungle font-semibold"
                          : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 shrink-0 ${isActive ? "text-jungle" : "text-gray-400 group-hover:text-gray-600"}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User info card at bottom */}
          <div className="border-t border-gray-200 px-3 py-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center text-sandstone font-body text-[11px] font-bold uppercase shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-body text-[12px] font-semibold text-charcoal truncate leading-tight">{userName ?? "—"}</p>
                <p className="font-body text-[10px] text-gray-400 truncate leading-tight">{userRole ?? "Admin"}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Mobile nav ────────────────────────────────────────────────────── */}
        <div className="md:hidden bg-white border-b border-gray-200 flex gap-1 px-3 py-2 overflow-x-auto shrink-0">
          {sections.flatMap((s) => s.items).filter((item) => can(item.permission)).map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 font-body text-xs transition-colors whitespace-nowrap border-b-2 ${
                  isActive
                    ? "border-jungle text-jungle font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
