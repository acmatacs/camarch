import type { Metadata } from "next";
import Link from "next/link";
import TempleForm from "@/components/admin/TempleForm";

export const metadata: Metadata = { title: "Add Temple — CamArch Admin" };

export default function NewTemplePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <nav className="flex items-center gap-1.5 font-body text-xs text-charcoal/40 mb-3">
          <Link href="/admin" className="hover:text-charcoal transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href="/admin/temples" className="hover:text-charcoal transition-colors">Temples</Link>
          <span>/</span>
          <span className="text-charcoal">New</span>
        </nav>
        <h1 className="font-heading text-2xl text-charcoal">Add Temple</h1>
        <p className="font-body text-sm text-charcoal/50 mt-1">Create a new temple record in the database.</p>
      </div>
      <TempleForm mode="create" />
    </div>
  );
}
