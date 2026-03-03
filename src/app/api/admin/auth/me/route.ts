import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

// ─── GET — return the currently authenticated admin user's identity ────────────
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const payload = await verifyAdminToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  return NextResponse.json({
    data: {
      id: payload.userId,
      email: payload.email,
      name: payload.name ?? null,
      roleName: payload.roleName ?? null,
      permissions: (payload.permissions as string[]) ?? [],
    },
  });
}
