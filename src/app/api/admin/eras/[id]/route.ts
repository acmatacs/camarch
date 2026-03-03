import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setAuditContext } from "@/lib/audit-context";

const EraSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const era = await prisma.era.findUnique({ where: { id: parseInt(id) } });
    if (!era) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: era });
  } catch (error) {
    console.error("[GET /api/admin/eras/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await setAuditContext(req);
    const { id } = await params;
    const body = await req.json();
    const parsed = EraSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const era = await prisma.era.update({
      where: { id: parseInt(id) },
      data: { name: parsed.data.name },
    });
    return NextResponse.json({ data: era });
  } catch (error: unknown) {
    console.error("[PUT /api/admin/eras/:id]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await setAuditContext(req);
    const { id } = await params;
    await prisma.era.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[DELETE /api/admin/eras/:id]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
