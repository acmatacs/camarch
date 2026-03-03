import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setAuditContext } from "@/lib/audit-context";

const StyleSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  period: z.string().max(200).optional().nullable(),
});

export async function GET() {
  try {
    const styles = await prisma.style.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { temples: true } } },
    });
    return NextResponse.json({ data: styles });
  } catch (error) {
    console.error("[GET /api/admin/styles]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await setAuditContext(req);
    const body = await req.json();
    const parsed = StyleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const style = await prisma.style.create({
      data: { name: parsed.data.name, period: parsed.data.period ?? null },
    });
    return NextResponse.json({ data: style }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/admin/styles]", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
