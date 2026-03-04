import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TempleForm from "@/components/admin/TempleForm";
import FilesRelatedList from "@/components/admin/FilesRelatedList";

type Props = { params: Promise<{ id: string }> };

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const STATUS_CLASSES: Record<string, string> = {
  DRAFT: "bg-charcoal/8 text-charcoal/55",
  PENDING_REVIEW: "bg-gold/15 text-gold/80",
  PUBLISHED: "bg-jungle/10 text-jungle",
  ARCHIVED: "bg-charcoal/5 text-charcoal/35",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const temple = await prisma.temple.findUnique({ where: { id: parseInt(id) }, select: { name: true } });
  return { title: temple ? `Edit ${temple.name} — CamArch Admin` : "Edit Temple" };
}

export default async function EditTemplePage({ params }: Props) {
  const { id } = await params;
  const temple = await prisma.temple.findUnique({
    where: { id: parseInt(id) },
    include: { province: true, king: true, style: true, era: true },
  });

  if (!temple) notFound();

  const initialData = {
    name: temple.name,
    khmerName: temple.khmerName ?? "",
    slug: temple.slug,
    description: temple.description,
    history: temple.history ?? "",
    featuredImage: temple.featuredImage ?? "",
    galleryImages: temple.galleryImages ?? [],
    latitude: String(temple.latitude),
    longitude: String(temple.longitude),
    yearBuilt: temple.yearBuilt ? String(temple.yearBuilt) : "",
    religion: temple.religion ?? "",
    provinceId: String(temple.provinceId),
    kingId: temple.kingId ? String(temple.kingId) : "",
    styleId: temple.styleId ? String(temple.styleId) : "",
    eraId: temple.eraId ? String(temple.eraId) : "",
    status: temple.status,
  };

  const statusLabel = STATUS_LABELS[temple.status] ?? temple.status;
  const statusCls = STATUS_CLASSES[temple.status] ?? "bg-charcoal/8 text-charcoal/55";

  return (
    <div className="space-y-0">

      {/* ── Record Header (Salesforce-style) ──────────────────────────── */}
      <div className="bg-white border border-charcoal/8 rounded-xl shadow-sm mb-6 px-6 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 font-body text-xs text-charcoal/40 mb-2">
          <Link href="/admin" className="hover:text-charcoal transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href="/admin/temples" className="hover:text-charcoal transition-colors">Temples</Link>
          <span>/</span>
          <span className="text-charcoal">{temple.name}</span>
        </nav>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-2xl text-charcoal">{temple.name}</h1>
            <span className={`text-xs font-body font-semibold px-2.5 py-1 rounded-full ${statusCls}`}>
              {statusLabel}
            </span>
            {temple.province && (
              <span className="text-xs font-body text-charcoal/40">{temple.province.name}</span>
            )}
          </div>

          {/* Action buttons — Save wired to the form by id */}
          <div className="flex items-center gap-2">
            <Link
              href="/admin/temples"
              className="btn-outline py-2 px-5 text-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              form="temple-form"
              className="btn-gold py-2 px-5 text-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* ── 2-column body ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left: main form */}
        <div className="lg:col-span-2">
          <TempleForm mode="edit" templeId={temple.id} initialData={initialData} />
        </div>

        {/* Right: related lists */}
        <div className="lg:col-span-1 space-y-4">

          {/* Files related list */}
          <FilesRelatedList templeId={temple.id} />

          {/* Record Info card */}
          <div className="bg-white rounded-xl border border-charcoal/8 shadow-sm p-5 space-y-3">
            <h3 className="font-heading text-xs text-charcoal/50 uppercase tracking-wide pb-2 border-b border-charcoal/8">
              Record Info
            </h3>
            <dl className="space-y-2.5">
              <div>
                <dt className="font-body text-[10px] text-charcoal/40 uppercase tracking-wide">Temple ID</dt>
                <dd className="font-body text-sm text-charcoal">#{temple.id}</dd>
              </div>
              <div>
                <dt className="font-body text-[10px] text-charcoal/40 uppercase tracking-wide">Created</dt>
                <dd className="font-body text-sm text-charcoal">
                  {new Date(temple.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </dd>
              </div>
              <div>
                <dt className="font-body text-[10px] text-charcoal/40 uppercase tracking-wide">Last Modified</dt>
                <dd className="font-body text-sm text-charcoal">
                  {new Date(temple.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </dd>
              </div>
              <div>
                <dt className="font-body text-[10px] text-charcoal/40 uppercase tracking-wide">Public URL</dt>
                <dd className="font-body text-xs">
                  <Link
                    href={`/temples/${temple.slug}`}
                    target="_blank"
                    className="text-jungle hover:underline truncate block"
                  >
                    /temples/{temple.slug}
                  </Link>
                </dd>
              </div>
            </dl>
          </div>

        </div>
      </div>
    </div>
  );
}

