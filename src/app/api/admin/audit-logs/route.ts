import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/auth";
import { ActionType } from "@prisma/client";

const VALID_ACTIONS = new Set(["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGIN_FAILED", "LOGOUT", "EXPORT"]);

const PAGE_SIZE = 50;

// ─── GET audit logs — paginated, filtered, last-first ─────────────────────────
// This is the ONLY allowed operation on AuditLog. DELETE / PUT are intentionally
// absent to enforce append-only immutability at the application layer.
export async function GET(req: NextRequest) {
  const denied = await checkPermission(req, "audit:read");
  if (denied) return denied;
  try {
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const rawAction = searchParams.get("action");
    const entityType = searchParams.get("entityType") ?? undefined;
    const actorEmail = searchParams.get("actorEmail") ?? undefined;

    // Validate action against the known set so bad values don't cause a DB error
    const action = rawAction && VALID_ACTIONS.has(rawAction) ? (rawAction as ActionType) : undefined;

    const where = {
      ...(action ? { action } : {}),
      ...(entityType ? { entityType } : {}),
      ...(actorEmail
        ? { actorEmail: { contains: actorEmail, mode: "insensitive" as const } }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      data: logs,
      meta: {
        total,
        page,
        limit: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/audit-logs]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
