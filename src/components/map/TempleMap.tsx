"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { MapTemple } from "@/types";

// Leaflet must be dynamically loaded client-side only
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

interface TempleMapProps {
  temples: MapTemple[];
}

export default function TempleMap({ temples }: TempleMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<MapTemple | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    // Dynamically load Leaflet only on client
    import("leaflet").then((L) => {
      // Fix default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: [12.9, 104.0],  // Cambodia center
        zoom: 8,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom gold marker
      const goldIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:30px;height:30px;
          background:#C57D3E;
          border:3px solid white;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 2px 8px rgba(0,0,0,0.35);
        "></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -32],
      });

      temples.forEach((temple) => {
        const marker = L.marker([temple.latitude, temple.longitude], { icon: goldIcon })
          .addTo(map);

        marker.on("click", () => {
          setSelected(temple);
          map.panTo([temple.latitude, temple.longitude], { animate: true });
        });

        // Simple tooltip on hover
        marker.bindTooltip(temple.name, {
          permanent: false,
          direction: "top",
          className: "leaflet-tooltip-temple",
          offset: [0, -32],
        });
      });

      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-sandstone/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <span className="font-body text-sm text-charcoal/60">Loading map…</span>
          </div>
        </div>
      )}

      {/* Temple preview card */}
      {selected && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[340px] max-w-[calc(100vw-2rem)]">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-charcoal/10">
            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 z-10 w-7 h-7 bg-charcoal/60 text-white rounded-full flex items-center justify-center hover:bg-charcoal transition-colors text-xs"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Image */}
            <div className="relative h-36 bg-charcoal/5">
              <Image
                src={selected.featuredImage || `https://picsum.photos/seed/${selected.slug}/480/240`}
                alt={selected.name}
                fill
                className="object-cover"
                unoptimized
              />
              {selected.era && (
                <span className="absolute top-2 left-2 font-body text-[10px] uppercase tracking-wider bg-charcoal/60 text-sandstone px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {selected.era.name}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-heading text-base font-semibold text-charcoal mb-0.5">
                {selected.name}
              </h3>
              {selected.khmerName && (
                <p className="font-body text-xs text-charcoal/40 mb-2">{selected.khmerName}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selected.religion && (
                  <span className="badge bg-jungle/8 text-jungle">{selected.religion}</span>
                )}
                {selected.yearBuilt && (
                  <span className="badge bg-gold/10 text-gold">c. {selected.yearBuilt}</span>
                )}
                {selected.style && (
                  <span className="badge bg-charcoal/6 text-charcoal/60">{selected.style.name}</span>
                )}
              </div>
              <Link
                href={`/temples/${selected.slug}`}
                className="btn-primary text-xs py-2 px-4 w-full text-center block"
              >
                View Temple →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
