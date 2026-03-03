"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface AdminTemple {
  id: number;
  name: string;
  slug: string;
  featuredImage: string;
  yearBuilt: number | null;
  religion: string | null;
  province: { name: string };
  era: { name: string } | null;
  style: { name: string } | null;
}

export default function AdminTemplesPage() {
  const [temples, setTemples] = useState<AdminTemple[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchTemples = () => {
    setLoading(true);
    fetch("/api/admin/temples")
      .then((r) => r.json())
      .then((d) => setTemples(d.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTemples(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/temples/${id}`, { method: "DELETE" });
      setTemples((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Failed to delete temple.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-charcoal mb-1">Temples</h1>
          <p className="font-body text-sm text-charcoal/50">{temples.length} total</p>
        </div>
        <Link href="/admin/temples/new" className="btn-primary text-sm py-2 px-4">
          + Add Temple
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : temples.length === 0 ? (
          <div className="text-center py-20 font-body text-sm text-charcoal/40">
            No temples yet. <Link href="/admin/temples/new" className="text-jungle underline">Add the first one →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal/8 bg-charcoal/2">
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 w-12" />
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40">Name</th>
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden sm:table-cell">Province</th>
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden md:table-cell">Style</th>
                  <th className="text-left px-5 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden lg:table-cell">Year</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/6">
                {temples.map((temple) => (
                  <tr key={temple.id} className="hover:bg-charcoal/2 transition-colors group">
                    {/* Thumbnail */}
                    <td className="px-5 py-3">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-charcoal/5 shrink-0">
                        <Image
                          src={temple.featuredImage || `https://picsum.photos/seed/${temple.slug}/80/80`}
                          alt={temple.name}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-body text-sm font-medium text-charcoal">{temple.name}</p>
                      <p className="font-body text-xs text-charcoal/35">/temples/{temple.slug}</p>
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-charcoal/60 hidden sm:table-cell">
                      {temple.province.name}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-charcoal/60 hidden md:table-cell">
                      {temple.style?.name ?? <span className="text-charcoal/25">—</span>}
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-charcoal/60 hidden lg:table-cell">
                      {temple.yearBuilt ?? <span className="text-charcoal/25">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/temples/${temple.slug}`}
                          target="_blank"
                          className="font-body text-xs text-charcoal/40 hover:text-charcoal transition-colors px-2 py-1 rounded hover:bg-charcoal/5"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/temples/${temple.id}/edit`}
                          className="font-body text-xs text-jungle hover:underline px-2 py-1 rounded hover:bg-jungle/5"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(temple.id, temple.name)}
                          disabled={deleting === temple.id}
                          className="font-body text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50 disabled:opacity-40"
                        >
                          {deleting === temple.id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
