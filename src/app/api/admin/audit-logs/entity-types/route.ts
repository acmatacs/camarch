import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Returns all distinct entityType values that exist in the audit log table.
 *  Powers the "Entity Type" filter dropdown — updates automatically as new
 *  entity types are added to the system. */
export async function GET() {
  try {
    const rows = await prisma.auditLog.findMany({
      select: { entityType: true },
      distinct: ["entityType"],
      where: { entityType: { not: null } },
      orderBy: { entityType: "asc" },
    });
    return NextResponse.json({ data: rows.map((r) => r.entityType).filter(Boolean) });
  } catch (error) {
    console.error("[GET /api/admin/audit-logs/entity-types]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
