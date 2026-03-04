import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Papa from "papaparse";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/auth";
import { setAuditContext } from "@/lib/audit-context";
import { logAuditEvent } from "@/lib/prisma";
import { COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

// ─── Row schema (CSV columns) ─────────────────────────────────────────────────
const RowSchema = z.object({
  name: z.string().min(1).max(200),
  khmerName: z.string().max(200).optional().default(""),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().min(1).max(5000),
  history: z.string().max(10000).optional().default(""),
  featuredImage: z.string().optional().default(""),
  galleryImages: z.string().optional().default(""), // pipe-separated URLs
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  yearBuilt: z.coerce.number().int().min(0).max(2100).optional().nullable(),
  religion: z.string().max(100).optional().default(""),
  provinceName: z.string().min(1),
  kingName: z.string().optional().default(""),
  styleName: z.string().optional().default(""),
  eraName: z.string().optional().default(""),
  status: z
    .enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "ARCHIVED"])
    .optional()
    .default("DRAFT"),
});

type ParsedRow = z.infer<typeof RowSchema>;

interface ImportError {
  row: number;
  errors: Record<string, string[] | undefined>;
}

/**
 * POST /api/admin/temples/import
 * Body: multipart/form-data with field "file" (text/csv)
 * Validates every row with Zod before committing — atomic transaction.
 */
export async function POST(req: NextRequest) {
  const denied = await checkPermission(req, "temples:write");
  if (denied) return denied;

  try {
    await setAuditContext(req);

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No CSV file provided" }, { status: 400 });
    }

    const csvText = await (file as File).text();

    // ── Parse CSV ─────────────────────────────────────────────────────────────
    const { data: rawRows, errors: parseErrors } = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    if (parseErrors.length > 0) {
      return NextResponse.json(
        { error: "CSV parse error", details: parseErrors.map((e) => e.message) },
        { status: 400 }
      );
    }

    if (rawRows.length === 0) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }

    if (rawRows.length > 500) {
      return NextResponse.json({ error: "Maximum 500 rows per import" }, { status: 400 });
    }

    // ── Validate every row ────────────────────────────────────────────────────
    const validRows: ParsedRow[] = [];
    const validationErrors: ImportError[] = [];

    rawRows.forEach((raw, i) => {
      const result = RowSchema.safeParse(raw);
      if (result.success) {
        validRows.push(result.data);
      } else {
        validationErrors.push({ row: i + 2, errors: result.error.flatten().fieldErrors });
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: validationErrors }, { status: 422 });
    }

    // ── Pre-load reference data in one query ──────────────────────────────────
    const [provinces, kings, styles, eras] = await Promise.all([
      prisma.province.findMany({ select: { id: true, name: true } }),
      prisma.king.findMany({ select: { id: true, name: true } }),
      prisma.style.findMany({ select: { id: true, name: true } }),
      prisma.era.findMany({ select: { id: true, name: true } }),
    ]);

    const provinceMap = new Map(provinces.map((p) => [p.name.toLowerCase(), p.id]));
    const kingMap = new Map(kings.map((k) => [k.name.toLowerCase(), k.id]));
    const styleMap = new Map(styles.map((s) => [s.name.toLowerCase(), s.id]));
    const eraMap = new Map(eras.map((e) => [e.name.toLowerCase(), e.id]));

    // Resolve FK ids and check for unknown references
    const refErrors: ImportError[] = [];
    const resolved = validRows.map((row, i) => {
      const provinceId = provinceMap.get(row.provinceName.toLowerCase());
      if (!provinceId) {
        refErrors.push({ row: i + 2, errors: { provinceName: [`Province "${row.provinceName}" not found`] } });
      }
      return {
        ...row,
        provinceId: provinceId ?? 0,
        kingId: row.kingName ? (kingMap.get(row.kingName.toLowerCase()) ?? null) : null,
        styleId: row.styleName ? (styleMap.get(row.styleName.toLowerCase()) ?? null) : null,
        eraId: row.eraName ? (eraMap.get(row.eraName.toLowerCase()) ?? null) : null,
        galleryImages: row.galleryImages ? row.galleryImages.split("|").map((u) => u.trim()).filter(Boolean) : [],
      };
    });

    if (refErrors.length > 0) {
      return NextResponse.json({ error: "Reference lookup failed", details: refErrors }, { status: 422 });
    }

    // ── Atomic insert ─────────────────────────────────────────────────────────
    const inserted = await prisma.$transaction(
      resolved.map((row) =>
        prisma.temple.create({
          data: {
            name: row.name,
            khmerName: row.khmerName || null,
            slug: row.slug,
            description: row.description,
            history: row.history || null,
            featuredImage: row.featuredImage || "",
            galleryImages: row.galleryImages,
            latitude: row.latitude,
            longitude: row.longitude,
            yearBuilt: row.yearBuilt ?? null,
            religion: row.religion || null,
            provinceId: row.provinceId,
            kingId: row.kingId,
            styleId: row.styleId,
            eraId: row.eraId,
            status: row.status,
          },
          select: { id: true, name: true, slug: true },
        })
      )
    );

    // Audit log the bulk import event
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const actor = token ? await verifyAdminToken(token) : null;
    logAuditEvent({
      action: "CREATE",
      entityType: "Temple",
      actorId: actor ? String(actor.userId) : null,
      actorEmail: actor?.email ?? null,
      newValues: { importedCount: inserted.length, slugs: inserted.map((t) => t.slug) },
    });

    return NextResponse.json({ data: { imported: inserted.length, temples: inserted } }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/temples/import]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
