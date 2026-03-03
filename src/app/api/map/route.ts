import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Lightweight endpoint for the map view — only returns fields needed to render pins
export async function GET() {
  try {
    const temples = await prisma.temple.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        khmerName: true,
        latitude: true,
        longitude: true,
        featuredImage: true,
        yearBuilt: true,
        religion: true,
        province: { select: { name: true } },
        era: { select: { name: true } },
        style: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: temples });
  } catch (error) {
    console.error("[GET /api/map]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
