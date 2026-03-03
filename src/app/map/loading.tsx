export default function MapLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-charcoal px-6 py-4 flex items-center gap-4 shrink-0">
        <div className="h-7 w-48 bg-white/20 rounded animate-pulse" />
        <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
      </div>

      {/* Map placeholder */}
      <div className="flex-1 relative bg-gray-200 animate-pulse overflow-hidden">
        {/* Subtle map grid lines for visual context */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(#888 1px, transparent 1px), linear-gradient(90deg, #888 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Centred spinner */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-charcoal/60 text-sm font-medium">Loading map…</p>
        </div>

        {/* Fake pins scattered across the placeholder */}
        {[
          { top: "38%", left: "48%" },
          { top: "42%", left: "52%" },
          { top: "35%", left: "45%" },
          { top: "55%", left: "42%" },
          { top: "30%", left: "58%" },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-gold/50 rounded-full animate-pulse"
            style={{ top: pos.top, left: pos.left, animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
