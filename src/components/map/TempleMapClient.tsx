"use client";

import dynamic from "next/dynamic";
import type { MapTemple } from "@/types";

const TempleMap = dynamic(() => import("./TempleMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-sandstone">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <span className="font-body text-sm text-charcoal/60">Loading map…</span>
      </div>
    </div>
  ),
});

export default function TempleMapClient({ temples }: { temples: MapTemple[] }) {
  return <TempleMap temples={temples} />;
}
