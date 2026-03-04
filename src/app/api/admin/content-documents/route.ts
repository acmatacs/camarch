import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkPermission, verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

const CreateDocSchema = z.object({
  title: z.string().min(1).max(255),
  url: z.string().url(),
  storagePath: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive().optional().nullable(),
  accessLevel: z.enum(["PUBLIC", "INTERNAL_ONLY"]).optional().default("PUBLIC"),
  templeId: z.number().int().positive(),
});

/**
 * GET /api/admin/content-documents?templeId=X
 * Returns all ContentDocuments for a temple, each with its latest ContentVersion.
 */
export async function GET(req: NextRequest) {
  const denied = await checkPermission(req, "temples:read");
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const templeId = searchParams.get("templeId");

    const docs = await prisma.contentDocument.findMany({
      where: templeId ? { templeId: parseInt(templeId) } : undefined,
      include: {
        temple: { select: { id: true, name: true, slug: true } },
        versions: {
          where: { isCurrent: true },
          include: { uploadedBy: { select: { id: true, name: true, email: true } } },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: docs });
  } catch (error) {
    console.error("[GET /api/admin/content-documents]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/content-documents
 * Creates a new ContentDocument + first ContentVersion (called after Supabase upload).
 */
export async function POST(req: NextRequest) {
  const denied = await checkPermission(req, "temples:write");
  if (denied) return denied;

  try {
    const body = await req.json();
    const parsed = CreateDocSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const token = req.cookies.get(COOKIE_NAME)?.value;
    const actor = token ? await verifyAdminToken(token) : null;

    const doc = await prisma.contentDocument.create({
      data: {
        title: parsed.data.title,
        templeId: parsed.data.templeId,
        versions: {
          create: {
            versionNumber: 1,
            url: parsed.data.url,
            storagePath: parsed.data.storagePath,
            mimeType: parsed.data.mimeType,
            sizeBytes: parsed.data.sizeBytes ?? null,
            accessLevel: parsed.data.accessLevel,
            isCurrent: true,
            uploadedById: actor?.userId ?? null,
          },
        },
      },
      include: {
        versions: {
          include: { uploadedBy: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return NextResponse.json({ data: doc }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/content-documents]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
