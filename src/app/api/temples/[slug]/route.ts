import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const temple = await prisma.temple.findUnique({
      where: { slug },
      include: {
        province: true,
        era: true,
        style: true,
        king: true,
      },
    });

    if (!temple || temple.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Temple not found" }, { status: 404 });
    }

    // Fetch nearby temples in same province (excluding self, published only)
    const nearby = await prisma.temple.findMany({
      where: {
        status: "PUBLISHED" as const,
        provinceId: temple.provinceId,
        slug: { not: slug },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        featuredImage: true,
        yearBuilt: true,
        province: { select: { name: true } },
        era: { select: { name: true } },
      },
      take: 4,
    });

    return NextResponse.json({ data: temple, nearby });
  } catch (error) {
    console.error("[GET /api/temples/[slug]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
