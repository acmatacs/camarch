import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setAuditContext } from "@/lib/audit-context";

const TempleSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  khmerName: z.string().max(200).optional().nullable(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().min(1, "Description is required").max(5000),
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
    await setAuditContext(req);
    const body = await req.json();
    const parsed = TempleSchema.safeParse(body);
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

    const temple = await prisma.temple.create({
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

    return NextResponse.json({ data: temple }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/admin/temples]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
