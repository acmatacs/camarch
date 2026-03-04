import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for server-side operations (storage, admin).
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 */
export function getServiceSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  return createClient(url, key);
}

export const MEDIA_BUCKET = "temple-media";

/** Allowed MIME types for temple media uploads */
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/** Max upload size: 10 MB */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
