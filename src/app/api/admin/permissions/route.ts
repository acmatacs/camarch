import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/auth";

// ─── GET — list all permissions, grouped by module ────────────────────────────
export async function GET(req: NextRequest) {
  const denied = await checkPermission(req, "roles:manage");
  if (denied) return denied;
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { action: "asc" }],
    });
    return NextResponse.json({ data: permissions });
  } catch (error) {
    console.error("[GET /api/admin/permissions]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
