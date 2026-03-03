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

export async function GET() {
  try {
    const kings = await prisma.king.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { temples: true } } },
    });
    return NextResponse.json({ data: kings });
  } catch (error) {
    console.error("[GET /api/admin/kings]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await setAuditContext(req);
    const body = await req.json();
    const parsed = KingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const king = await prisma.king.create({
      data: {
        name: parsed.data.name,
        reignStart: parsed.data.reignStart ?? null,
        reignEnd: parsed.data.reignEnd ?? null,
        description: parsed.data.description ?? null,
      },
    });
    return NextResponse.json({ data: king }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/admin/kings]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
