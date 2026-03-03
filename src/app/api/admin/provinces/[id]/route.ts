import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ProvinceSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional().nullable(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const province = await prisma.province.findUnique({ where: { id: parseInt(id) } });
    if (!province) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: province });
  } catch (error) {
    console.error("[GET /api/admin/provinces/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = ProvinceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const province = await prisma.province.update({
      where: { id: parseInt(id) },
      data: { name: parsed.data.name, description: parsed.data.description ?? null },
    });
    return NextResponse.json({ data: province });
  } catch (error: unknown) {
    console.error("[PUT /api/admin/provinces/:id]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.province.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[DELETE /api/admin/provinces/:id]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
