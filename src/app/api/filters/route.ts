import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Returns all filter options for the search/filter UI
export async function GET() {
  try {
    const [provinces, eras, styles, kings] = await Promise.all([
      prisma.province.findMany({ orderBy: { name: "asc" } }),
      prisma.era.findMany({ orderBy: { name: "asc" } }),
      prisma.style.findMany({ orderBy: { name: "asc" } }),
      prisma.king.findMany({ orderBy: { name: "asc" } }),
    ]);

    return NextResponse.json({ provinces, eras, styles, kings });
  } catch (error) {
    console.error("[GET /api/filters]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
