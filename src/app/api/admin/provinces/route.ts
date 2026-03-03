import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setAuditContext } from "@/lib/audit-context";

const ProvinceSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional().nullable(),
});

export async function GET() {
  try {
    const provinces = await prisma.province.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { temples: true } } },
    });
    return NextResponse.json({ data: provinces });
  } catch (error) {
    console.error("[GET /api/admin/provinces]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await setAuditContext(req);
    const body = await req.json();
    const parsed = ProvinceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const province = await prisma.province.create({
      data: { name: parsed.data.name, description: parsed.data.description ?? null },
    });
    return NextResponse.json({ data: province }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/admin/provinces]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
