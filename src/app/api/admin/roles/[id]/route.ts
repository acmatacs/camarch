import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const ROLE_SELECT = {
  id: true,
  name: true,
  description: true,
  isSystem: true,
  createdAt: true,
  updatedAt: true,
  permissions: {
    select: { permission: { select: { id: true, action: true, module: true } } },
  },
  _count: { select: { users: true } },
} as const;

// ─── PUT — update role name/description and reassign permissions ──────────────
const UpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  // Full replacement of permission set
  permissionIds: z.array(z.number().int().positive()),
});

export async function PUT(req: NextRequest, { params }: Params) {
  const denied = await checkPermission(req, "roles:manage");
  if (denied) return denied;
  try {
    const { id } = await params;
    const roleId = parseInt(id);
    if (isNaN(roleId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.adminRole.findUnique({ where: { id: roleId } });
    if (!existing) return NextResponse.json({ error: "Role not found" }, { status: 404 });

    // Check name uniqueness if changing name on a non-system role
    if (parsed.data.name && parsed.data.name !== existing.name) {
      if (existing.isSystem) {
        return NextResponse.json({ error: "System role names cannot be changed." }, { status: 403 });
      }
      const clash = await prisma.adminRole.findUnique({ where: { name: parsed.data.name } });
      if (clash) return NextResponse.json({ error: "A role with this name already exists." }, { status: 409 });
    }

    // Replace permissions atomically: delete all → re-create
    await prisma.rolePermission.deleteMany({ where: { roleId } });

    const updateData: Record<string, unknown> = {};
    if (parsed.data.name && !existing.isSystem) updateData.name = parsed.data.name;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description ?? null;

    const role = await prisma.adminRole.update({
      where: { id: roleId },
      data: {
        ...updateData,
        permissions: {
          create: parsed.data.permissionIds.map((permissionId) => ({ permissionId })),
        },
      },
      select: ROLE_SELECT,
    });

    return NextResponse.json({
      data: { ...role, permissions: role.permissions.map((rp) => rp.permission) },
    });
  } catch (error: unknown) {
    console.error("[PUT /api/admin/roles/:id]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ─── DELETE — only custom (non-system) roles can be deleted ──────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  const denied = await checkPermission(req, "roles:manage");
  if (denied) return denied;
  try {
    const { id } = await params;
    const roleId = parseInt(id);
    if (isNaN(roleId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const existing = await prisma.adminRole.findUnique({
      where: { id: roleId },
      include: { _count: { select: { users: true } } },
    });
    if (!existing) return NextResponse.json({ error: "Role not found" }, { status: 404 });
    if (existing.isSystem) {
      return NextResponse.json({ error: "System roles cannot be deleted." }, { status: 403 });
    }
    if (existing._count.users > 0) {
      return NextResponse.json(
        { error: `This role is assigned to ${existing._count.users} user(s). Reassign them first.` },
        { status: 409 }
      );
    }

    await prisma.adminRole.delete({ where: { id: roleId } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[DELETE /api/admin/roles/:id]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
