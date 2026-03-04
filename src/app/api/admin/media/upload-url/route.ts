import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkPermission } from "@/lib/auth";
import { getServiceSupabase, MEDIA_BUCKET, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/supabase";

const UploadUrlSchema = z.object({
  filename: z.string().min(1).max(200),
  mimeType: z.enum(ALLOWED_MIME_TYPES as unknown as [string, ...string[]]),
  sizeBytes: z.number().int().positive().max(MAX_FILE_SIZE_BYTES, `File size must not exceed ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB`),
  templeId: z.number().int().positive(),
});

/**
 * POST /api/admin/media/upload-url
 * Returns a Supabase Storage pre-signed upload URL.
 * The client uploads the file directly, then calls POST /api/admin/media to save the record.
 */
export async function POST(req: NextRequest) {
  const denied = await checkPermission(req, "temples:write");
  if (denied) return denied;

  try {
    const body = await req.json();
    const parsed = UploadUrlSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { filename, mimeType, sizeBytes, templeId } = parsed.data;

    // Sanitise filename and build storage path
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const storagePath = `temples/${templeId}/${safeName}`;

    const supabase = getServiceSupabase();
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      console.error("[upload-url] Supabase error:", error);
      return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        signedUrl: data.signedUrl,
        token: data.token,
        storagePath,
        // Public URL (available after upload for PUBLIC access level)
        publicUrl: `${process.env.SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath}`,
        mimeType,
        sizeBytes,
        templeId,
      },
    });
  } catch (error) {
    console.error("[POST /api/admin/media/upload-url]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
