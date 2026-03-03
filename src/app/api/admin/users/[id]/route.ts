import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma, logAuditEvent } from "@/lib/prisma";
import { setAuditContext } from "@/lib/audit-context";
import { verifyAdminToken, COOKIE_NAME, checkPermission } from "@/lib/auth";

const UpdateSchema = z.object({
  email: z.string().email("Invalid email").optional(),
  name: z.string().max(100).optional().nullable(),
  roleId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  // Password only updated if provided; empty/missing = no change
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
});

// Shared select
const USER_SELECT = {
  id: true, email: true, name: true,
  isActive: true,
  roleId: true,
  role: { select: { id: true, name: true } },
  createdAt: true, updatedAt: true,
} as const;

type Params = { params: Promise<{ id: string }> };

function getActor(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return token ? verifyAdminToken(token) : Promise.resolve(null);
}

// ─── PUT — update user details (email, name, optional password) ───────────────
export async function PUT(req: NextRequest, { params }: Params) {
  const denied = await checkPermission(req, "users:manage");
  if (denied) return denied;
  try {
    await setAuditContext(req);
    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const actor = await getActor(req);

    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Fetch existing record
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check email uniqueness if changed
    if (parsed.data.email && parsed.data.email !== existing.email) {
      const clash = await prisma.user.findUnique({ where: { email: parsed.data.email } });
      if (clash) return NextResponse.json({ error: "Email already in use." }, { status: 409 });
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.email) updateData.email = parsed.data.email;
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name ?? null;
    if (parsed.data.roleId) updateData.roleId = parsed.data.roleId;
    if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;
    if (parsed.data.password) updateData.passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: USER_SELECT,
    });

    logAuditEvent({
      action: "UPDATE",
      entityType: "User",
      entityId: String(user.id),
      actorId: actor ? String(actor.userId) : null,
      actorEmail: actor?.email ?? null,
      oldValues: { id: existing.id, email: existing.email, name: existing.name },
      newValues: { id: user.id, email: user.email, name: user.name },
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    });

    return NextResponse.json({ data: user });
  } catch (error: unknown) {
    console.error("[PUT /api/admin/users/:id]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ─── DELETE — remove admin user (cannot delete yourself) ─────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  const denied = await checkPermission(req, "users:manage");
  if (denied) return denied;
  try {
    await setAuditContext(req);
    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const actor = await getActor(req);

    // Self-delete guard
    if (actor && actor.userId === userId) {
      return NextResponse.json({ error: "You cannot delete your own account." }, { status: 403 });
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await prisma.user.delete({ where: { id: userId } });

    logAuditEvent({
      action: "DELETE",
      entityType: "User",
      entityId: String(userId),
      actorId: actor ? String(actor.userId) : null,
      actorEmail: actor?.email ?? null,
      oldValues: { id: existing.id, email: existing.email, name: existing.name },
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[DELETE /api/admin/users/:id]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
