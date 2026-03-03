import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "fallback-secret-change-me");
const COOKIE_NAME = "camarch_admin";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/api/admin/auth"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (!isAdminRoute) return NextResponse.next();

  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      // Require admin:access permission
      const permissions = (payload.permissions ?? []) as string[];
      if (permissions.includes("admin:access")) {
        return NextResponse.next();
      }
      // Authenticated but missing permission → 403
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/admin/login", req.url));
    } catch {
      // Token invalid / expired — fall through
    }
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
