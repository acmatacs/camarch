import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "fallback-secret-change-me");
const COOKIE_NAME = "camarch_admin";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/api/admin/auth"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard admin routes
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (!isAdminRoute) return NextResponse.next();

  // Allow login page and auth API through
  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Verify JWT cookie
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      // Token invalid / expired — fall through to redirect
    }
  }

  // Unauthenticated request to an API admin route → 401
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Unauthenticated request to admin UI → redirect to login
  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
