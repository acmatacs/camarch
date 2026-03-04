import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/auth";
import { getServiceSupabase, MEDIA_BUCKET } from "@/lib/supabase";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/content-documents/:id
 * Returns a ContentDocument with ALL its versions (version history).
 */
export async function GET(req: NextRequest, { params }: Params) {
  const denied = await checkPermission(req, "temples:read");
  if (denied) return denied;

  try {
    const { id } = await params;
    const doc = await prisma.contentDocument.findUnique({
      where: { id: parseInt(id) },
      include: {
        versions: {
          include: { uploadedBy: { select: { id: true, name: true, email: true } } },
          orderBy: { versionNumber: "desc" },
        },
      },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ data: doc });
  } catch (error) {
    console.error("[GET /api/admin/content-documents/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/content-documents/:id
 * Deletes the ContentDocument, all its ContentVersions, and all associated Supabase Storage objects.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const denied = await checkPermission(req, "temples:write");
  if (denied) return denied;

  try {
    const { id } = await params;
    const docId = parseInt(id);

    const doc = await prisma.contentDocument.findUnique({
      where: { id: docId },
      include: { versions: true },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Remove all storage objects (best-effort)
    try {
      const supabase = getServiceSupabase();
      const storagePaths = doc.versions
        .map((v) => v.storagePath)
        .filter((p): p is string => !!p);
      if (storagePaths.length > 0) {
        await supabase.storage.from(MEDIA_BUCKET).remove(storagePaths);
      }
    } catch (storageErr) {
      console.warn("[content-doc delete] Storage removal failed (non-fatal):", storageErr);
    }

    // Cascade delete removes all ContentVersions automatically
    await prisma.contentDocument.delete({ where: { id: docId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/content-documents/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
