import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const EraSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
});

export async function GET() {
  try {
    const eras = await prisma.era.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { temples: true } } },
    });
    return NextResponse.json({ data: eras });
  } catch (error) {
    console.error("[GET /api/admin/eras]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = EraSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const era = await prisma.era.create({
      data: { name: parsed.data.name },
    });
    return NextResponse.json({ data: era }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/admin/eras]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
