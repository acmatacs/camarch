import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── GET all temples (admin — no pagination limit) ────────────────────────────
export async function GET() {
  try {
    const temples = await prisma.temple.findMany({
      include: {
        province: { select: { id: true, name: true } },
        era: { select: { id: true, name: true } },
        style: { select: { id: true, name: true } },
        king: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: temples });
  } catch (error) {
    console.error("[GET /api/admin/temples]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST create a new temple ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, khmerName, slug, description, history,
      featuredImage, galleryImages,
      latitude, longitude, yearBuilt, religion,
      provinceId, kingId, styleId, eraId,
    } = body;

    if (!name || !slug || !description || !provinceId || latitude == null || longitude == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const temple = await prisma.temple.create({
      data: {
        name,
        khmerName: khmerName || null,
        slug,
        description,
        history: history || null,
        featuredImage: featuredImage || "",
        galleryImages: galleryImages || [],
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
        religion: religion || null,
        provinceId: parseInt(provinceId),
        kingId: kingId ? parseInt(kingId) : null,
        styleId: styleId ? parseInt(styleId) : null,
        eraId: eraId ? parseInt(eraId) : null,
      },
    });

    return NextResponse.json({ data: temple }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/admin/temples]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
