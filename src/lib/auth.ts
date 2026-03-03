import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "fallback-secret-change-me");
const COOKIE_NAME = "camarch_admin";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export interface AdminTokenPayload {
  userId: number;
  email: string;
  name: string | null;
  roleName: string | null;
  permissions: string[];  // e.g. ["admin:access", "temples:write", ...]
}

export async function signAdminToken(payload: AdminTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyAdminToken(
  token: string
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AdminTokenPayload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME, COOKIE_MAX_AGE };

/**
 * Read the JWT from the request cookie and return 403 if the required
 * permission is missing. Returns null when the check passes.
 * Usage: const denied = await checkPermission(req, "users:manage");
 *        if (denied) return denied;
 */
export async function checkPermission(
  req: import("next/server").NextRequest,
  permission: string
): Promise<import("next/server").NextResponse | null> {
  const { NextResponse } = await import("next/server");
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyAdminToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(payload.permissions ?? []).includes(permission)) {
    return NextResponse.json(
      { error: `Forbidden: requires "${permission}" permission` },
      { status: 403 }
    );
  }
  return null;
}
