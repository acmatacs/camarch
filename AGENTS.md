# Agent Context — CamArch

> **How to use this file:**  
> At the start of every new Copilot/AI session, say:
> _"Read AGENTS.md and continue where we left off."_  
> Update this file at the end of each session before closing VS Code.

---

## Project in One Line

CamArch is a Next.js 16 / Prisma / PostgreSQL (Supabase) platform for discovering Khmer temples, with a full admin CMS protected by a dynamic JWT-based RBAC system.

---

## Current Version: v1.2.0

Full changelog: `camarch-wiki/Releases.md`

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 App Router |
| Language | TypeScript 5 |
| Styling | Tailwind CSS (`charcoal`, `gold`, `jungle`, `sandstone` tokens) |
| ORM | Prisma 5 |
| Database | PostgreSQL on Supabase |
| Auth | JWT via `jose`, HttpOnly cookie `camarch_admin`, 8h expiry |
| Validation | Zod |
| Maps | Leaflet / react-leaflet |

---

## Architecture: What Exists

### Public Site
- `/` — Hero, featured carousel, category cards, map callout
- `/temples` — Filtered listing (search, province, era, style, king, religion)
- `/temples/[slug]` — Full temple detail page
- `/map` — Interactive Leaflet map
- `/about` — Creator credit, mission, timeline, stats

### Admin CMS (`/admin`)
All pages require a valid JWT with `admin:access` permission.

| URL | Permission | Description |
|-----|-----------|-------------|
| `/admin` | `admin:access` | Dashboard |
| `/admin/temples` | `temples:read` | Temple list + CRUD |
| `/admin/users` | `users:manage` | Admin user management |
| `/admin/roles` | `roles:manage` | SF PermissionSet-style roles editor |
| `/admin/audit-logs` | `audit:read` | Immutable action log |
| `/admin/provinces` | `temples:write` | Reference data |
| `/admin/kings` | `temples:write` | Reference data |
| `/admin/styles` | `temples:write` | Reference data |
| `/admin/eras` | `temples:write` | Reference data |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | JWT sign/verify + `checkPermission(req, key)` helper |
| `src/lib/audit-context.ts` | `setAuditContext()` + `logAuditEvent()` |
| `src/lib/prisma.ts` | Prisma singleton |
| `src/proxy.ts` | Edge middleware — guards all `/admin/*` routes |
| `src/app/admin/layout.tsx` | SF Setup-style sidebar, permission-filtered nav |
| `prisma/schema.prisma` | Full DB schema |
| `prisma/seed.ts` | Seeds temples, roles, permissions |

---

## RBAC System

- Permissions stored in DB, loaded at login into JWT: `{ userId, name, email, roleName, permissions: string[] }`
- **API guard pattern** (used in every sensitive route):
  ```typescript
  const denied = await checkPermission(req, "users:manage");
  if (denied) return denied;
  ```
- **Sidebar nav** filtered client-side via `/api/admin/auth/me`

### Seeded Roles

| Role | Permissions |
|------|-------------|
| System Admin | All 7 |
| Heritage Manager | `admin:access`, `temples:read`, `temples:write`, `audit:read` |
| Field Staff | `admin:access`, `temples:read`, `temples:write` |

### Permission Keys
`admin:access` · `temples:read` · `temples:write` · `temples:delete` · `users:manage` · `roles:manage` · `audit:read`

---

## Database Models (summary)

- `Temple` — core content (slug, name, khmerName, images, GPS, FK to Province/King/Style/Era)
- `Province`, `King`, `Style`, `Era` — reference data
- `User` — admin accounts (`isActive`, FK to `AdminRole`)
- `AdminRole` — named roles (`isSystem` flag)
- `Permission` — permission keys with module grouping
- `RolePermission` — join table
- `AuditLog` — append-only action log

---

## Code Conventions

- **API routes:** Zod validation → `checkPermission` → DB operation → audit log
- **Tailwind:** use `charcoal`, `gold`, `jungle`, `sandstone` tokens; `font-heading` / `font-body`
- **Error responses:** `NextResponse.json({ error: "..." }, { status: 4xx })`
- **No hard deletes on Users** — use `isActive: false` instead
- **AuditLog is immutable** — no PUT/DELETE routes should ever be added for it
- **Admin pages are CSR** (`"use client"`) — form state + fetch mutations
- **`max-w-3xl` is removed** from all admin list pages — use `overflow-x-auto` on table wrappers

---

## Environment Variables (`.env.local`)

```
DATABASE_URL=       # Supabase pooled connection
DIRECT_URL=         # Supabase direct connection (migrations)
JWT_SECRET=         # Min 32 chars
```

---

## Pending / Known Items

- [ ] Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env vars to Vercel for media uploads to work in production
- [ ] Create the Supabase Storage bucket named `temple-media` (public for PUBLIC access level)
- [ ] Temple write/delete API routes `checkPermission` guards are NOW ADDED ✅
- [ ] Reference data routes (`/api/admin/provinces`, `/api/admin/kings`, `/api/admin/styles`, `/api/admin/eras`) are **still not guarded** — needs `temples:write` guard
- [ ] Password change in user edit modal — currently replaces hash if a new password is provided; no "confirm password" field yet
- [ ] Existing seeded temples have `status: DRAFT` — need to be published manually or via the approve endpoint

---

## Last Session Summary (March 4, 2026 — Session 2)

- Added `TempleStatus` enum (DRAFT, PENDING_REVIEW, PUBLISHED, ARCHIVED) + `Media` model to Prisma schema
- `Media` model has: url, mimeType, sizeBytes, version, tags[], accessLevel (PUBLIC/INTERNAL_ONLY), templeId, uploadedById
- DB synced via `prisma db push`
- Installed `papaparse` + `yet-another-react-lightbox`
- Public APIs (`/api/temples`, `/api/temples/[slug]`, `/api/map`) now filter by `status: PUBLISHED`
- Admin temple APIs now have `checkPermission` guards (GET→temples:read, POST/PUT→temples:write, DELETE→temples:delete)
- `status` field added to create/update schema and Prisma calls
- New endpoint: `POST /api/admin/temples/[id]/approve` — state machine transition with role check (PUBLISHED requires System Admin or Heritage Manager)
- New endpoint: `POST /api/admin/temples/import` — CSV bulk import via Papaparse + Zod row validation + Prisma transaction (max 500 rows)
- New endpoint: `GET /api/admin/temples/export?format=csv|geojson` — downloads all temples as CSV or GeoJSON
- New Supabase Storage helper: `src/lib/supabase.ts` with `getServiceSupabase()`, bucket name, allowed MIME types, max size
- New endpoint: `POST /api/admin/media/upload-url` — generates Supabase Storage pre-signed upload URL (JPEG/PNG/WebP, max 10MB)
- New endpoint: `GET|POST /api/admin/media` — list media by templeId / save media record post-upload
- New endpoint: `DELETE /api/admin/media/[id]` — deletes DB record + Supabase Storage object
- `TempleForm.tsx` updated: status select field + media upload grid (edit mode only) with upload/delete
- Admin temples page: status badge column, Publish/Archive quick actions, Import CSV button, Export CSV/GeoJSON buttons
- `MediaLightbox.tsx` component created using `yet-another-react-lightbox` — grid view + lightbox viewer
- 0 TypeScript errors confirmed
- All changes committed and pushed to `origin/main`
