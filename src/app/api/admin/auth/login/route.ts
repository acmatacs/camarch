import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma, logAuditEvent } from "@/lib/prisma";
import { signAdminToken, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/auth";

// Simple in-memory brute-force guard
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  record.count += 1;
  return record.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many attempts. Try again in 15 minutes." },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Look up user with their role and permissions
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    const permissions = user?.role?.permissions.map((rp) => rp.permission.action) ?? [];
    if (!user || !permissions.includes("admin:access")) {
      logAuditEvent({ action: "LOGIN_FAILED", actorEmail: email, ipAddress: ip, userAgent: req.headers.get("user-agent") });
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Block inactive accounts
    if (!user.isActive) {
      logAuditEvent({ action: "LOGIN_FAILED", actorEmail: email, ipAddress: ip, userAgent: req.headers.get("user-agent") });
      return NextResponse.json({ error: "Your account has been deactivated. Contact a system administrator." }, { status: 403 });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      logAuditEvent({ action: "LOGIN_FAILED", actorEmail: email, ipAddress: ip, userAgent: req.headers.get("user-agent") });
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signAdminToken({
      userId: user.id,
      email: user.email,
      name: user.name ?? null,
      roleName: user.role?.name ?? null,
      permissions,
    });

    const res = NextResponse.json({ ok: true, name: user.name ?? user.email });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    logAuditEvent({ action: "LOGIN", actorId: String(user.id), actorEmail: user.email, ipAddress: ip, userAgent: req.headers.get("user-agent") });
    return res;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
