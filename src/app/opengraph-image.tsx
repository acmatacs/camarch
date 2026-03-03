import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CamArch – Cambodian Archaeological Discovery Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Decorative border */}
        <div
          style={{
            position: "absolute",
            inset: 24,
            border: "2px solid rgba(212, 175, 55, 0.3)",
            borderRadius: 16,
          }}
        />

        {/* Temple silhouette strip */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 180,
            background:
              "linear-gradient(to top, rgba(26,26,46,0.95) 0%, transparent 100%)",
          }}
        />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, zIndex: 10 }}>
          {/* Gold accent line */}
          <div style={{ width: 80, height: 3, background: "#d4af37", borderRadius: 2 }} />

          {/* Subtitle */}
          <div
            style={{
              fontSize: 16,
              letterSpacing: 8,
              color: "#d4af37",
              textTransform: "uppercase",
            }}
          >
            CAMBODIAN ARCHAEOLOGY
          </div>

          {/* Main title */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 700,
              color: "#f5f0e8",
              letterSpacing: 4,
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            CamArch
          </div>

          {/* Gold accent line */}
          <div style={{ width: 80, height: 3, background: "#d4af37", borderRadius: 2 }} />

          {/* Description */}
          <div
            style={{
              fontSize: 22,
              color: "rgba(245,240,232,0.7)",
              textAlign: "center",
              maxWidth: 700,
              marginTop: 8,
            }}
          >
            Discover 20+ ancient Khmer temples across Cambodia
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
