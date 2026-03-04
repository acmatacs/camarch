# Agent Context — CamArch

> **How to use this file:**  
> At the start of every new Copilot/AI session, say:
> _"Read AGENTS.md and continue where we left off."_  
> Update this file at the end of each session before closing VS Code.

---

## Project in One Line

CamArch is a Next.js 16 / Prisma / PostgreSQL (Supabase) platform for discovering Khmer temples, with a full admin CMS protected by a dynamic JWT-based RBAC system.

---

## Current Version: v1.4.0

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
| `/admin/temples/[id]` | `temples:read` | SF-style record detail — inline edit, related lists |
| `/admin/temples/[id]/edit` | `temples:write` | Full-page edit (standalone, 2-col SF layout) |
| `/admin/files` | `temples:read` | All files across all temples |
| `/admin/content-documents/[id]` | `temples:read` | File detail + version history |
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

- `Temple` — core content (slug, name, khmerName, images, GPS, FK to Province/King/Style/Era, TempleStatus)
- `Province`, `King`, `Style`, `Era` — reference data
- `User` — admin accounts (`isActive`, FK to `AdminRole`, back-relation to `ContentVersion`)
- `AdminRole` — named roles (`isSystem` flag)
- `Permission` — permission keys with module grouping
- `RolePermission` — join table
- `AuditLog` — append-only action log
- `ContentDocument` — file entity; title + templeId; has multiple `ContentVersion` records
- `ContentVersion` — a specific file upload version; url, storagePath, mimeType, sizeBytes, versionNumber, isCurrent, accessLevel, uploadedById → User

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
- [ ] Reference data routes (`/api/admin/provinces`, `/api/admin/kings`, `/api/admin/styles`, `/api/admin/eras`) are **still not guarded** — needs `temples:write` guard
- [ ] Password change in user edit modal — currently replaces hash if a new password is provided; no "confirm password" field yet
- [ ] Existing seeded temples have `status: DRAFT` — need to be published manually or via the approve endpoint
- [ ] `MediaLightbox.tsx` in `src/components/ui/` may now be dead code — was used by the old media grid; can be removed if unused
- [ ] `/admin/files` page currently loads all documents in one request — consider adding server-side pagination when file count grows

---

## Last Session Summary (March 4, 2026 — Session 5)

### Navigation & UX pattern fixes
- Sidebar: added **Files** nav item (`/admin/files`, `temples:read` permission, folder icon) between Temples and Administration group
- Temple list page (`/admin/temples`):
  - Temple name → links to record detail page `/admin/temples/[id]`
  - "View" action → links to record detail page (was linking to public site)
  - "Edit" action → opens `TempleEditModal` (popup modal, for quick inline edits from the list)

### SF-style record detail page (`/admin/temples/[id]/page.tsx`)
- **Inline editing**: clicking Edit in the header swaps the left column to the full `TempleForm` in place — no modal; header replaces Edit/Delete with Save/Cancel
- **Layout follows SF conventions:**
  - Left column (lg:2/3): Temple Details → Content → Record Info (at bottom of main body)
  - Right column (lg:1/3): `FilesRelatedList` (top) → Gallery preview (below)
- On save: re-fetches temple and returns to read-only view
- Delete navigates to `/admin/temples` list

### TempleEditModal (`src/components/admin/TempleEditModal.tsx`)
- Used only from the list page "Edit" row action (not from the detail page)
- Self-fetches full temple data on open; shows loading spinner until ready
- Proper modal styling: `bg-black/40 backdrop-blur-[2px]` overlay, white sticky header, `bg-[#f3f3f3]` body so nested `TempleForm` white cards render cleanly
- Fixed earlier broken style (was `bg-charcoal/5` body which clashed with card backgrounds)

### File detail page (`/admin/content-documents/[id]/page.tsx`)
- Server component; fetches ContentDocument with all versions + temple via Prisma
- Breadcrumb: Dashboard / Temples / [temple] / Files / [doc title]
- Version history table: v-badge (green = current), size, MIME, uploader, date, Download per row
- File Info summary card at bottom (doc id, version count, current size, first uploaded)
- Download Current button in header

### Files admin list page (`/admin/files/page.tsx`)
- Lists all ContentDocuments across all temples (no templeId filter)
- Columns: thumbnail, file title + version badge + version count, temple (links to detail), MIME, size, uploader, relative time
- Search filter by title or temple name
- Hover actions: Download, View (→ file detail page), Delete
- `FilesRelatedList` filename links updated: now navigate to `/admin/content-documents/${doc.id}` (removed inline version history expansion)

### API changes
- `GET /api/admin/content-documents` — `templeId` is now **optional**; omitting it returns all documents across all temples (includes `temple` relation in response)
- Response shape now always includes `temple: { id, name, slug }` field

### Commits
- `feat: SF-style temple record detail, edit modal from list/detail, View links to detail page`
- `feat: inline edit on record detail, files in right sidebar, record info in left column`
- `feat: fix modal styling, add Files to sidebar nav, Files admin page`

---

## Previous Session Summary (March 4, 2026 — Session 4)

- Added `onSuccess?: () => void` prop to `TempleForm` — when provided, called instead of `router.push("/admin/temples")`, enabling use inside a modal
- Created `TempleEditModal.tsx` (`src/components/admin/TempleEditModal.tsx`):
  - Self-fetches full temple data from `GET /api/admin/temples/:id` on open
  - Sticky header with temple name, Save button (targets `form="temple-form"`), close (×)
  - Scroll-trapped backdrop, Escape key closes
  - Loading spinner while fetching, error state if fetch fails
  - Wraps `TempleForm` in edit mode; calls `onSaved()` + `onClose()` on success
- Created `/admin/temples/[id]/page.tsx` — SF-style record detail page:
  - Client component, fetches temple on load, re-fetches after modal save
  - Header: breadcrumb, temple name + status badge, Public Page link, Delete button, Edit button (opens modal)
  - Left col (lg:2): Temple Details card (Province, Style, Era, King, Year, Religion, GPS), Content card (Description, History), FilesRelatedList
  - Right col (lg:1): Gallery preview grid, Record Info card (ID, slug, dates, link to full edit page)
  - Edit button triggers `TempleEditModal`; Delete navigates to list on success
- Updated `/admin/temples/page.tsx`:
  - Temple name → `<Link href="/admin/temples/${id}">` (record detail page)
  - "View" action → `<Link href="/admin/temples/${id}">` (record detail page, not public)
  - "Edit" action → `setEditingTemple(temple)` opens `TempleEditModal`
  - Added `TempleEditModal` render at bottom of component with `onSaved: fetchTemples`
- 0 TypeScript errors confirmed
- Committed and pushed: `feat: SF-style temple record detail, edit modal from list/detail, View links to detail page`

- Replaced `Media` model with `ContentDocument` + `ContentVersion` to mirror Salesforce's ContentDocument/ContentVersion pattern
- `ContentDocument`: title, templeId; parent file entity  
- `ContentVersion`: versionNumber, url, storagePath, mimeType, sizeBytes, accessLevel, isCurrent, documentId, uploadedById → User
- DB synced via `prisma db push` (dropped old 1-row Media table)
- Prisma client regenerated
- Added `contentVersions ContentVersion[]` back-relation to User model
- Created new API routes:
  - `GET|POST /api/admin/content-documents` — list by templeId / create new document + first version
  - `GET|DELETE /api/admin/content-documents/[id]` — fetch with all versions / delete doc + all storage objects
  - `GET|POST /api/admin/content-documents/[id]/versions` — list version history / add new version (marks previous isCurrent=false)
- Tombstoned old `GET|POST /api/admin/media` and `DELETE /api/admin/media/[id]` routes (410 Gone)
- Created `FilesRelatedList` component (`src/components/admin/FilesRelatedList.tsx`):
  - SF-style "Files" related list with file count badge and "Upload File" button
  - File rows: thumbnail preview, title (click = expand), version badge (`v2`), private badge, size, uploader, time ago
  - Actions on hover: Preview (lightbox), Download, Upload New Version (🔄), Delete
  - Expandable version history panel: shows all versions with isCurrent indicator, download link, uploader, date
  - Built-in lightbox for image preview
  - 3-step upload flow: `POST /api/admin/media/upload-url` → `PUT signedUrl` → `POST /api/admin/content-documents` or `POST /api/admin/content-documents/[id]/versions`
- Removed all media state/handlers/JSX from `TempleForm.tsx`
- Added `id="temple-form"` to `<form>` in TempleForm so header Save button can trigger it via `form="temple-form"`
- Redesigned `/admin/temples/[id]/edit` with Salesforce 2-column layout:
  - Header bar: breadcrumb, temple name, status badge, province, Save Changes / Cancel buttons (Save wired to form id)
  - Left column (lg:col-span-2): TempleForm
  - Right column (lg:col-span-1): FilesRelatedList + Record Info card (ID, Created, Last Modified, Public URL)
- Fixed `.env.local` — added `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- 0 TypeScript errors confirmed
- Committed and pushed: `feat: SF-style record layout with ContentDocument/ContentVersion file management`

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
