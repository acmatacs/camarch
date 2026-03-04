import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const doc = await prisma.contentDocument.findUnique({
    where: { id: parseInt(id) },
    select: { title: true },
  });
  return { title: doc ? `${doc.title} — CamArch Files` : "File Detail" };
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export default async function ContentDocumentPage({ params }: Props) {
  const { id } = await params;
  const doc = await prisma.contentDocument.findUnique({
    where: { id: parseInt(id) },
    include: {
      temple: { select: { id: true, name: true, slug: true } },
      versions: {
        include: {
          uploadedBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { versionNumber: "desc" },
      },
    },
  });

  if (!doc) notFound();

  const currentVersion = doc.versions.find((v) => v.isCurrent) ?? doc.versions[0];

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm px-6 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 font-body text-xs text-charcoal/40 mb-2 flex-wrap">
          <Link href="/admin" className="hover:text-charcoal transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href="/admin/temples" className="hover:text-charcoal transition-colors">Temples</Link>
          <span>/</span>
          <Link href={`/admin/temples/${doc.temple.id}/edit`} className="hover:text-charcoal transition-colors">
            {doc.temple.name}
          </Link>
          <span>/</span>
          <span className="text-charcoal/60">Files</span>
          <span>/</span>
          <span className="text-charcoal">{doc.title}</span>
        </nav>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            {/* File icon */}
            <div className="w-10 h-10 rounded-lg bg-sandstone/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <h1 className="font-heading text-2xl text-charcoal">{doc.title}</h1>
              <p className="font-body text-sm text-charcoal/45 mt-0.5">
                {doc.versions.length} {doc.versions.length === 1 ? "version" : "versions"} ·{" "}
                <Link href={`/admin/temples/${doc.temple.id}/edit`} className="text-jungle hover:underline">
                  {doc.temple.name}
                </Link>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/temples/${doc.temple.id}/edit`}
              className="btn-outline py-2 px-5 text-sm"
            >
              ← Back to {doc.temple.name}
            </Link>
            {currentVersion && (
              <a
                href={currentVersion.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold py-2 px-5 text-sm"
              >
                Download Current
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Version History ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal/8 flex items-center gap-2">
          <svg className="w-4 h-4 text-charcoal/35" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="font-heading text-sm text-charcoal">Version History</h2>
          <span className="text-[10px] font-body font-semibold bg-charcoal/8 text-charcoal/55 px-2 py-0.5 rounded-full">
            {doc.versions.length}
          </span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-charcoal/8 bg-charcoal/[0.02]">
              <th className="text-left px-6 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40">Version</th>
              <th className="text-left px-6 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden sm:table-cell">Size</th>
              <th className="text-left px-6 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden md:table-cell">Type</th>
              <th className="text-left px-6 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40">Uploaded By</th>
              <th className="text-left px-6 py-3 font-body text-[10px] uppercase tracking-wider text-charcoal/40 hidden lg:table-cell">Date</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/6">
            {doc.versions.map((v) => (
              <tr key={v.id} className={`hover:bg-charcoal/2 transition-colors ${v.isCurrent ? "bg-jungle/[0.025]" : ""}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-body font-bold px-2 py-0.5 rounded ${
                      v.isCurrent
                        ? "bg-jungle text-white"
                        : "bg-charcoal/10 text-charcoal/50"
                    }`}>
                      v{v.versionNumber}
                    </span>
                    {v.isCurrent && (
                      <span className="font-body text-xs text-jungle font-semibold">Current</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-body text-sm text-charcoal/60 hidden sm:table-cell">
                  {formatSize(v.sizeBytes)}
                </td>
                <td className="px-6 py-4 font-body text-xs text-charcoal/40 hidden md:table-cell">
                  {v.mimeType}
                </td>
                <td className="px-6 py-4 font-body text-sm text-charcoal/60">
                  {v.uploadedBy?.name ?? v.uploadedBy?.email ?? <span className="text-charcoal/25">—</span>}
                </td>
                <td className="px-6 py-4 font-body text-sm text-charcoal/40 hidden lg:table-cell">
                  {new Date(v.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  <a
                    href={v.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-xs text-jungle hover:underline px-3 py-1.5 rounded-lg border border-jungle/20 hover:bg-jungle/5 transition-colors"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── File Info ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm p-6">
        <h3 className="font-heading text-xs text-charcoal/50 uppercase tracking-wide pb-3 border-b border-charcoal/8 mb-4">
          File Info
        </h3>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div>
            <dt className="font-body text-[10px] text-charcoal/40 uppercase tracking-wide mb-1">Document ID</dt>
            <dd className="font-body text-sm text-charcoal">#{doc.id}</dd>
          </div>
          <div>
            <dt className="font-body text-[10px] text-charcoal/40 uppercase tracking-wide mb-1">Versions</dt>
            <dd className="font-body text-sm text-charcoal">{doc.versions.length}</dd>
          </div>
          <div>
            <dt className="font-body text-[10px] text-charcoal/40 uppercase tracking-wide mb-1">Current Size</dt>
            <dd className="font-body text-sm text-charcoal">{formatSize(currentVersion?.sizeBytes ?? null)}</dd>
          </div>
          <div>
            <dt className="font-body text-[10px] text-charcoal/40 uppercase tracking-wide mb-1">First Uploaded</dt>
            <dd className="font-body text-sm text-charcoal">
              {new Date(doc.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </dd>
          </div>
        </dl>
      </div>

    </div>
  );
}
