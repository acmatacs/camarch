import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/auth";

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

// ─── GET — list all roles with their permissions ──────────────────────────────
export async function GET(req: NextRequest) {
  const denied = await checkPermission(req, "roles:manage");
  if (denied) return denied;
  try {
    const roles = await prisma.adminRole.findMany({
      select: ROLE_SELECT,
      orderBy: { createdAt: "asc" },
    });
    // Flatten permissions array for convenience
    const data = roles.map((r) => ({
      ...r,
      permissions: r.permissions.map((rp) => rp.permission),
    }));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/admin/roles]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST — create a new custom role ─────────────────────────────────────────
const CreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  permissionIds: z.array(z.number().int().positive()).optional(),
});

export async function POST(req: NextRequest) {
  const denied = await checkPermission(req, "roles:manage");
  if (denied) return denied;
  try {
    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, description, permissionIds = [] } = parsed.data;

    const existing = await prisma.adminRole.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "A role with this name already exists." }, { status: 409 });
    }

    const role = await prisma.adminRole.create({
      data: {
        name,
        description: description ?? null,
        isSystem: false,
        permissions: {
          create: permissionIds.map((permissionId) => ({ permissionId })),
        },
      },
      select: ROLE_SELECT,
    });

    return NextResponse.json({
      data: { ...role, permissions: role.permissions.map((rp) => rp.permission) },
    }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/admin/roles]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
