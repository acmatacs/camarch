import { AsyncLocalStorage } from "async_hooks";
import type { NextRequest } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

// ─── Actor context shape ──────────────────────────────────────────────────────

export interface ActorContext {
  actorId: string | null;
  actorEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

// ─── Module-level AsyncLocalStorage store ─────────────────────────────────────
// The Prisma extension reads from this store when creating audit log entries.
// It is populated by `setAuditContext()` at the top of each mutation handler.

export const auditStore = new AsyncLocalStorage<ActorContext>();

/**
 * Populate the audit context for the current async continuation.
 *
 * Call this ONCE at the very top of any mutating route handler (POST, PUT,
 * DELETE). From that point, every Prisma mutation in the same async chain will
 * automatically carry the actor's identity — no further changes to call-sites.
 *
 * Uses `enterWith()` so no callback wrapper is needed.
 */
export async function setAuditContext(req: NextRequest): Promise<void> {
  let actorId: string | null = null;
  let actorEmail: string | null = null;

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    const payload = await verifyAdminToken(token);
    if (payload) {
      actorId = String(payload.userId);
      actorEmail = payload.email;
    }
  }

  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;
  const userAgent = req.headers.get("user-agent") ?? null;

  auditStore.enterWith({ actorId, actorEmail, ipAddress, userAgent });
}
