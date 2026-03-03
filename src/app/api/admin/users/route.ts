import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma, logAuditEvent } from "@/lib/prisma";
import { setAuditContext } from "@/lib/audit-context";
import { verifyAdminToken, COOKIE_NAME, checkPermission } from "@/lib/auth";

const CreateSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().max(100).optional().nullable(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.number().int().positive("Role is required"),
});

// Shared select — never expose passwordHash
const USER_SELECT = {
  id: true, email: true, name: true,
  isActive: true,
  roleId: true,
  role: { select: { id: true, name: true } },
  createdAt: true, updatedAt: true,
} as const;

// ─── GET — list all users that have a role assigned ───────────────────────────
export async function GET(req: NextRequest) {
  const denied = await checkPermission(req, "users:manage");
  if (denied) return denied;
  try {
    const users = await prisma.user.findMany({
      where: { roleId: { not: null } },
      select: USER_SELECT,
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST — create a new admin user ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  const denied = await checkPermission(req, "users:manage");
  if (denied) return denied;
  try {
    await setAuditContext(req);

    // Identify the actor for manual audit log
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const actor = token ? await verifyAdminToken(token) : null;

    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, name, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, name: name ?? null, passwordHash, roleId: parsed.data.roleId },
      select: USER_SELECT,
    });

    logAuditEvent({
      action: "CREATE",
      entityType: "User",
      entityId: String(user.id),
      actorId: actor ? String(actor.userId) : null,
      actorEmail: actor?.email ?? null,
      newValues: { id: user.id, email: user.email, name: user.name, role: user.role?.name },
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/admin/users]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
