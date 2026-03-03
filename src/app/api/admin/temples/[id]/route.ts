import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// ─── GET single temple ────────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const temple = await prisma.temple.findUnique({
      where: { id: parseInt(id) },
      include: {
        province: true,
        era: true,
        style: true,
        king: true,
      },
    });
    if (!temple) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: temple });
  } catch (error) {
    console.error("[GET /api/admin/temples/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PUT update temple ────────────────────────────────────────────────────────
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
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

    const temple = await prisma.temple.update({
      where: { id: parseInt(id) },
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

    return NextResponse.json({ data: temple });
  } catch (error: unknown) {
    console.error("[PUT /api/admin/temples/:id]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ─── DELETE temple ────────────────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.temple.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[DELETE /api/admin/temples/:id]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
