import type { TempleDetail } from "@/types";
import Link from "next/link";

interface QuickFactsPanelProps {
  temple: TempleDetail;
}

interface Fact {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export default function QuickFactsPanel({ temple }: QuickFactsPanelProps) {
  const facts: Fact[] = [
    ...(temple.yearBuilt
      ? [{ icon: <CalendarIcon />, label: "Year Built", value: `c. ${temple.yearBuilt} CE` }]
      : []),
    ...(temple.king
      ? [{ icon: <CrownIcon />, label: "Commissioned By", value: temple.king.name }]
      : []),
    ...(temple.era
      ? [{ icon: <EraIcon />, label: "Historical Era", value: temple.era.name }]
      : []),
    ...(temple.style
      ? [{ icon: <ArchIcon />, label: "Architectural Style", value: temple.style.name || "" }]
      : []),
    ...(temple.religion
      ? [{ icon: <LotusIcon />, label: "Religion", value: temple.religion }]
      : []),
    { icon: <PinIcon />, label: "Province", value: temple.province.name },
    {
      icon: <CoordIcon />,
      label: "Coordinates",
      value: `${temple.latitude.toFixed(4)}° N, ${temple.longitude.toFixed(4)}° E`,
    },
  ];

  return (
    <div className="space-y-5">
      {/* ─── Quick Facts ─── */}
      <div className="rounded-xl border border-charcoal/10 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-charcoal/8 bg-charcoal/2">
          <h2 className="font-heading text-sm font-semibold text-charcoal tracking-wide">
            Quick Facts
          </h2>
        </div>
        <div className="divide-y divide-charcoal/6">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-start gap-3 px-5 py-3.5">
              <span className="mt-0.5 text-gold shrink-0">{fact.icon}</span>
              <div>
                <p className="font-body text-[10px] text-charcoal/40 uppercase tracking-wider mb-0.5">
                  {fact.label}
                </p>
                <p className="font-body text-sm text-charcoal font-medium">
                  {fact.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Map Link ─── */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${temple.latitude},${temple.longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-charcoal/15 font-body text-sm text-charcoal/50 hover:border-jungle hover:text-jungle transition-all duration-200 group"
      >
        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Open in Google Maps
      </a>

      {/* ─── Back link ─── */}
      <Link
        href="/temples"
        className="flex items-center gap-2 font-body text-sm text-charcoal/40 hover:text-jungle transition-colors duration-200"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to all temples
      </Link>
    </div>
  );
}

// ─── Icon components ─────────────────────────────────────────────────────────
const iconClass = "w-4 h-4";

function CalendarIcon() {
  return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}
function CrownIcon() {
  return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3l3.5 5.5L12 4l3.5 4.5L19 3l-2 13H7L5 3z" /></svg>;
}
function EraIcon() {
  return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function ArchIcon() {
  return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
}
function LotusIcon() {
  return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 22c-1-3-4-5-7-6 2-1 4-3 5-6 1 2 3 5 6 6-4 1-6 3-4 6z" /></svg>;
}
function PinIcon() {
  return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}
function CoordIcon() {
  return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>;
}
function TicketIcon() {
  return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>;
}
function ClockIcon() {
  return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
