import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/auth";
import { logAuditEvent } from "@/lib/prisma";
import { COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

interface TempleRow {
  id: number;
  name: string;
  khmerName: string | null;
  slug: string;
  description: string;
  history: string | null;
  featuredImage: string;
  galleryImages: string[];
  latitude: number;
  longitude: number;
  yearBuilt: number | null;
  religion: string | null;
  status: string;
  createdAt: Date;
  province: { name: string };
  era: { name: string } | null;
  style: { name: string } | null;
  king: { name: string } | null;
}

/**
 * GET /api/admin/temples/export?format=csv|geojson
 * Exports all temples. Defaults to csv.
 */
export async function GET(req: NextRequest) {
  const denied = await checkPermission(req, "temples:read");
  if (denied) return denied;

  try {
    const format = new URL(req.url).searchParams.get("format") ?? "csv";
    if (!["csv", "geojson"].includes(format)) {
      return NextResponse.json({ error: "format must be csv or geojson" }, { status: 400 });
    }

    const temples = (await prisma.temple.findMany({
      include: {
        province: { select: { name: true } },
        era: { select: { name: true } },
        style: { select: { name: true } },
        king: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    })) as TempleRow[];

    // Audit the export
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const actor = token ? await verifyAdminToken(token) : null;
    logAuditEvent({
      action: "EXPORT",
      entityType: "Temple",
      actorId: actor ? String(actor.userId) : null,
      actorEmail: actor?.email ?? null,
      newValues: { format, count: temples.length },
    });

    const timestamp = new Date().toISOString().split("T")[0];

    if (format === "csv") {
      const rows = temples.map((t) => ({
        id: t.id,
        name: t.name,
        khmerName: t.khmerName ?? "",
        slug: t.slug,
        description: t.description,
        history: t.history ?? "",
        featuredImage: t.featuredImage,
        galleryImages: t.galleryImages.join("|"),
        latitude: t.latitude,
        longitude: t.longitude,
        yearBuilt: t.yearBuilt ?? "",
        religion: t.religion ?? "",
        status: t.status,
        provinceName: t.province.name,
        eraName: t.era?.name ?? "",
        styleName: t.style?.name ?? "",
        kingName: t.king?.name ?? "",
        createdAt: t.createdAt.toISOString(),
      }));

      const csv = Papa.unparse(rows);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="camarch-temples-${timestamp}.csv"`,
        },
      });
    }

    // ── GeoJSON ───────────────────────────────────────────────────────────────
    const geojson = {
      type: "FeatureCollection",
      features: temples.map((t) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [t.longitude, t.latitude],
        },
        properties: {
          id: t.id,
          name: t.name,
          khmerName: t.khmerName,
          slug: t.slug,
          description: t.description.slice(0, 300),
          yearBuilt: t.yearBuilt,
          religion: t.religion,
          status: t.status,
          province: t.province.name,
          era: t.era?.name ?? null,
          style: t.style?.name ?? null,
          king: t.king?.name ?? null,
          featuredImage: t.featuredImage,
        },
      })),
    };

    return new NextResponse(JSON.stringify(geojson, null, 2), {
      headers: {
        "Content-Type": "application/geo+json; charset=utf-8",
        "Content-Disposition": `attachment; filename="camarch-temples-${timestamp}.geojson"`,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/temples/export]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
