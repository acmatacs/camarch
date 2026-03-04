import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkPermission, verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const NewVersionSchema = z.object({
  url: z.string().url(),
  storagePath: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive().optional().nullable(),
  accessLevel: z.enum(["PUBLIC", "INTERNAL_ONLY"]).optional().default("PUBLIC"),
});

/**
 * GET /api/admin/content-documents/:id/versions
 * Returns all versions of a document, newest first.
 */
export async function GET(req: NextRequest, { params }: Params) {
  const denied = await checkPermission(req, "temples:read");
  if (denied) return denied;

  try {
    const { id } = await params;
    const versions = await prisma.contentVersion.findMany({
      where: { documentId: parseInt(id) },
      include: { uploadedBy: { select: { id: true, name: true, email: true } } },
      orderBy: { versionNumber: "desc" },
    });

    return NextResponse.json({ data: versions });
  } catch (error) {
    console.error("[GET /api/admin/content-documents/:id/versions]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/content-documents/:id/versions
 * Adds a new ContentVersion to an existing document.
 * Marks the previous "current" version as no longer current.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const denied = await checkPermission(req, "temples:write");
  if (denied) return denied;

  try {
    const { id } = await params;
    const docId = parseInt(id);
    const body = await req.json();
    const parsed = NewVersionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const token = req.cookies.get(COOKIE_NAME)?.value;
    const actor = token ? await verifyAdminToken(token) : null;

    // Get next version number
    const latest = await prisma.contentVersion.findFirst({
      where: { documentId: docId },
      orderBy: { versionNumber: "desc" },
    });
    const nextVersion = (latest?.versionNumber ?? 0) + 1;

    const [, newVersion] = await prisma.$transaction([
      // Mark all existing versions as not current
      prisma.contentVersion.updateMany({
        where: { documentId: docId, isCurrent: true },
        data: { isCurrent: false },
      }),
      // Create the new current version
      prisma.contentVersion.create({
        data: {
          versionNumber: nextVersion,
          url: parsed.data.url,
          storagePath: parsed.data.storagePath,
          mimeType: parsed.data.mimeType,
          sizeBytes: parsed.data.sizeBytes ?? null,
          accessLevel: parsed.data.accessLevel,
          isCurrent: true,
          documentId: docId,
          uploadedById: actor?.userId ?? null,
        },
        include: { uploadedBy: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    // Bump document updatedAt
    await prisma.contentDocument.update({
      where: { id: docId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ data: newVersion }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/content-documents/:id/versions]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
