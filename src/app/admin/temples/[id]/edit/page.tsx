import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TempleForm from "@/components/admin/TempleForm";

type Props = { params: Promise<{ id: string }> };

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
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <nav className="flex items-center gap-1.5 font-body text-xs text-charcoal/40 mb-3">
          <Link href="/admin" className="hover:text-charcoal transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href="/admin/temples" className="hover:text-charcoal transition-colors">Temples</Link>
          <span>/</span>
          <span className="text-charcoal">Edit</span>
        </nav>
        <h1 className="font-heading text-2xl text-charcoal">Edit Temple</h1>
        <p className="font-body text-sm text-charcoal/50 mt-1">
          Editing: <span className="text-charcoal font-medium">{temple.name}</span>
        </p>
      </div>
      <TempleForm mode="edit" templeId={temple.id} initialData={initialData} />
    </div>
  );
}
