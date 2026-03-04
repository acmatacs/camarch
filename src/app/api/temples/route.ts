import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") ?? "";
    const provinceId = searchParams.get("provinceId");
    const eraId = searchParams.get("eraId");
    const styleId = searchParams.get("styleId");
    const kingId = searchParams.get("kingId");
    const religion = searchParams.get("religion");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "12")));
    const skip = (page - 1) * limit;

    const where = {
      status: "PUBLISHED" as const,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { khmerName: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(provinceId && { provinceId: parseInt(provinceId) }),
      ...(eraId && { eraId: parseInt(eraId) }),
      ...(styleId && { styleId: parseInt(styleId) }),
      ...(kingId && { kingId: parseInt(kingId) }),
      ...(religion && { religion: { contains: religion, mode: "insensitive" as const } }),
    };

    const [temples, total] = await Promise.all([
      prisma.temple.findMany({
        where,
        include: {
          province: { select: { id: true, name: true } },
          era: { select: { id: true, name: true } },
          style: { select: { id: true, name: true } },
          king: { select: { id: true, name: true } },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.temple.count({ where }),
    ]);

    return NextResponse.json({
      data: temples,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/temples]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
