import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getStats() {
  const [temples, provinces, kings, styles, eras] = await Promise.all([
    prisma.temple.count(),
    prisma.province.count(),
    prisma.king.count(),
    prisma.style.count(),
    prisma.era.count(),
  ]);
  return { temples, provinces, kings, styles, eras };
}

async function getRecentTemples() {
  return prisma.temple.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true, createdAt: true, province: { select: { name: true } } },
  });
}

export default async function AdminDashboard() {
  const [stats, recent] = await Promise.all([getStats(), getRecentTemples()]);

  const statCards = [
    { label: "Temples", count: stats.temples, href: "/admin/temples", icon: "🏛️", color: "bg-jungle" },
    { label: "Provinces", count: stats.provinces, href: "#", icon: "📍", color: "bg-gold" },
    { label: "Kings", count: stats.kings, href: "#", icon: "👑", color: "bg-charcoal" },
    { label: "Styles", count: stats.styles, href: "#", icon: "🏗️", color: "bg-charcoal/60" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl text-charcoal mb-1">Dashboard</h1>
        <p className="font-body text-sm text-charcoal/50">Overview of the CamArch database</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-charcoal/8 shadow-sm p-5 flex flex-col gap-2"
          >
            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center text-xl`}>
              {card.icon}
            </div>
            <p className="font-heading text-3xl text-charcoal">{card.count}</p>
            <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm p-6">
        <h2 className="font-heading text-sm text-charcoal mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/temples/new" className="btn-primary text-sm py-2 px-4">
            + Add Temple
          </Link>
          <Link href="/admin/temples" className="btn-outline text-sm py-2 px-4">
            Manage Temples
          </Link>
        </div>
      </div>

      {/* Recent temples */}
      <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal/8 flex items-center justify-between">
          <h2 className="font-heading text-sm text-charcoal">Recently Added Temples</h2>
          <Link href="/admin/temples" className="font-body text-xs text-jungle hover:underline">
            View all →
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-charcoal/6">
              <th className="text-left px-6 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40">Name</th>
              <th className="text-left px-6 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden sm:table-cell">Province</th>
              <th className="text-left px-6 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden md:table-cell">Added</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/6">
            {recent.map((t) => (
              <tr key={t.id} className="hover:bg-charcoal/2 transition-colors">
                <td className="px-6 py-3.5 font-body text-sm text-charcoal">{t.name}</td>
                <td className="px-6 py-3.5 font-body text-sm text-charcoal/50 hidden sm:table-cell">{t.province.name}</td>
                <td className="px-6 py-3.5 font-body text-xs text-charcoal/40 hidden md:table-cell">
                  {new Date(t.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </td>
                <td className="px-6 py-3.5 text-right">
                  <Link href={`/admin/temples/${t.id}/edit`} className="font-body text-xs text-jungle hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
