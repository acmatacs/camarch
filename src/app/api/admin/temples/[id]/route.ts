import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const TempleUpdateSchema = z.object({
  name: z.string().min(1).max(200),
  khmerName: z.string().max(200).optional().nullable(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().min(1).max(5000),
  history: z.string().max(10000).optional().nullable(),
  featuredImage: z.string().url().optional().or(z.literal("")),
  galleryImages: z.array(z.string().url()).optional().default([]),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  yearBuilt: z.coerce.number().int().min(0).max(2100).optional().nullable(),
  religion: z.string().max(100).optional().nullable(),
  provinceId: z.coerce.number().int().positive(),
  kingId: z.coerce.number().int().positive().optional().nullable(),
  styleId: z.coerce.number().int().positive().optional().nullable(),
  eraId: z.coerce.number().int().positive().optional().nullable(),
});

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
    const parsed = TempleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      name, khmerName, slug, description, history,
      featuredImage, galleryImages,
      latitude, longitude, yearBuilt, religion,
      provinceId, kingId, styleId, eraId,
    } = parsed.data;

    const temple = await prisma.temple.update({
      where: { id: parseInt(id) },
      data: {
        name,
        khmerName: khmerName ?? null,
        slug,
        description,
        history: history ?? null,
        featuredImage: featuredImage ?? "",
        galleryImages: galleryImages ?? [],
        latitude,
        longitude,
        yearBuilt: yearBuilt ?? null,
        religion: religion ?? null,
        provinceId,
        kingId: kingId ?? null,
        styleId: styleId ?? null,
        eraId: eraId ?? null,
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
