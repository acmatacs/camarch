import { NextResponse } from "next/server";

// Superseded by /api/admin/content-documents/[id]
export async function DELETE() {
  return NextResponse.json({ error: "Moved to /api/admin/content-documents/[id]" }, { status: 410 });
}
