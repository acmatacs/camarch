import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkPermission, verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

const MediaCreateSchema = z.object({
  url: z.string().url(),
  storagePath: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive().optional().nullable(),
  version: z.number().int().positive().optional().default(1),
  tags: z.array(z.string()).optional().default([]),
  accessLevel: z.enum(["PUBLIC", "INTERNAL_ONLY"]).optional().default("PUBLIC"),
  templeId: z.number().int().positive(),
});

/**
 * GET /api/admin/media?templeId=X
 * Returns media for a temple. INTERNAL_ONLY items are only returned to
 * authenticated staff with temples:read permission.
 */
export async function GET(req: NextRequest) {
  const denied = await checkPermission(req, "temples:read");
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const templeId = searchParams.get("templeId");
    if (!templeId) {
      return NextResponse.json({ error: "templeId is required" }, { status: 400 });
    }

    const media = await prisma.media.findMany({
      where: { templeId: parseInt(templeId) },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: media });
  } catch (error) {
    console.error("[GET /api/admin/media]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/media
 * Called after a successful Supabase Storage upload to persist the Media record.
 */
export async function POST(req: NextRequest) {
  const denied = await checkPermission(req, "temples:write");
  if (denied) return denied;

  try {
    const body = await req.json();
    const parsed = MediaCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const token = req.cookies.get(COOKIE_NAME)?.value;
    const actor = token ? await verifyAdminToken(token) : null;

    const media = await prisma.media.create({
      data: {
        url: parsed.data.url,
        mimeType: parsed.data.mimeType,
        sizeBytes: parsed.data.sizeBytes ?? null,
        version: parsed.data.version,
        tags: parsed.data.tags,
        accessLevel: parsed.data.accessLevel,
        templeId: parsed.data.templeId,
        uploadedById: actor?.userId ?? null,
      },
    });

    return NextResponse.json({ data: media }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/media]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
