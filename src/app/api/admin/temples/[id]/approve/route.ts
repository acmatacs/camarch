import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkPermission, verifyAdminToken, COOKIE_NAME } from "@/lib/auth";
import { setAuditContext } from "@/lib/audit-context";

const ApproveSchema = z.object({
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "ARCHIVED"]),
});

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/temples/:id/approve
 * Transitions temple status. Publishing (→ PUBLISHED) requires the
 * System Admin or Heritage Manager role in addition to temples:write.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const denied = await checkPermission(req, "temples:write");
  if (denied) return denied;

  try {
    await setAuditContext(req);
    const { id } = await params;
    const body = await req.json();
    const parsed = ApproveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    // Restrict PUBLISHED transitions to System Admin + Heritage Manager
    if (status === "PUBLISHED") {
      const token = req.cookies.get(COOKIE_NAME)?.value;
      const payload = token ? await verifyAdminToken(token) : null;
      const allowedRoles = ["System Admin", "Heritage Manager"];
      if (!payload || !allowedRoles.includes(payload.roleName ?? "")) {
        return NextResponse.json(
          { error: "Only System Admin or Heritage Manager can publish temples" },
          { status: 403 }
        );
      }
    }

    const temple = await prisma.temple.findUnique({ where: { id: parseInt(id) } });
    if (!temple) {
      return NextResponse.json({ error: "Temple not found" }, { status: 404 });
    }

    const updated = await prisma.temple.update({
      where: { id: parseInt(id) },
      data: { status },
      select: { id: true, name: true, slug: true, status: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[POST /api/admin/temples/:id/approve]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
