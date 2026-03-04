import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/auth";
import { getServiceSupabase, MEDIA_BUCKET } from "@/lib/supabase";

type Params = { params: Promise<{ id: string }> };

/**
 * DELETE /api/admin/media/:id
 * Deletes the Media DB record and the corresponding Supabase Storage object.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const denied = await checkPermission(req, "temples:write");
  if (denied) return denied;

  try {
    const { id } = await params;
    const mediaId = parseInt(id);

    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Delete from Supabase Storage (best-effort)
    // Derive storage path from URL: .../object/public/bucket/path → extract path
    try {
      const supabase = getServiceSupabase();
      const urlParts = media.url.split(`/${MEDIA_BUCKET}/`);
      if (urlParts.length === 2) {
        const storagePath = urlParts[1];
        await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
      }
    } catch (storageErr) {
      console.warn("[media delete] Storage removal failed (non-fatal):", storageErr);
    }

    await prisma.media.delete({ where: { id: mediaId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/media/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
