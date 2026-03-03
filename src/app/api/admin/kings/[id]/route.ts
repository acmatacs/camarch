import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setAuditContext } from "@/lib/audit-context";

const KingSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  reignStart: z.coerce.number().int().positive().optional().nullable(),
  reignEnd: z.coerce.number().int().positive().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const king = await prisma.king.findUnique({ where: { id: parseInt(id) } });
    if (!king) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: king });
  } catch (error) {
    console.error("[GET /api/admin/kings/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await setAuditContext(req);
    const { id } = await params;
    const body = await req.json();
    const parsed = KingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const king = await prisma.king.update({
      where: { id: parseInt(id) },
      data: {
        name: parsed.data.name,
        reignStart: parsed.data.reignStart ?? null,
        reignEnd: parsed.data.reignEnd ?? null,
        description: parsed.data.description ?? null,
      },
    });
    return NextResponse.json({ data: king });
  } catch (error: unknown) {
    console.error("[PUT /api/admin/kings/:id]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await setAuditContext(req);
    const { id } = await params;
    await prisma.king.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[DELETE /api/admin/kings/:id]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
