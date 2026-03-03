import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setAuditContext } from "@/lib/audit-context";

const StyleSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  period: z.string().max(200).optional().nullable(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const style = await prisma.style.findUnique({ where: { id: parseInt(id) } });
    if (!style) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: style });
  } catch (error) {
    console.error("[GET /api/admin/styles/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await setAuditContext(req);
    const { id } = await params;
    const body = await req.json();
    const parsed = StyleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const style = await prisma.style.update({
      where: { id: parseInt(id) },
      data: { name: parsed.data.name, period: parsed.data.period ?? null },
    });
    return NextResponse.json({ data: style });
  } catch (error: unknown) {
    console.error("[PUT /api/admin/styles/:id]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await setAuditContext(req);
    const { id } = await params;
    await prisma.style.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[DELETE /api/admin/styles/:id]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
