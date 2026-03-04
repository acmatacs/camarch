import { NextResponse } from "next/server";

// This route has been superseded by /api/admin/content-documents
// Kept as a placeholder to avoid 404s during transition.

export async function GET() {
  return NextResponse.json({ error: "Moved to /api/admin/content-documents" }, { status: 410 });
}
export async function POST() {
  return NextResponse.json({ error: "Moved to /api/admin/content-documents" }, { status: 410 });
}
