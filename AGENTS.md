# Agent Context — CamArch

> **How to use this file:**  
> At the start of every new Copilot/AI session, say:
> _"Read AGENTS.md and continue where we left off."_  
> Update this file at the end of each session before closing VS Code.

---

## Project in One Line

CamArch is a Next.js 16 / Prisma / PostgreSQL (Supabase) platform for discovering Khmer temples, with a full admin CMS protected by a dynamic JWT-based RBAC system.

---

## Current Version: v1.1.0

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

- [ ] Temple write/delete API routes (`/api/admin/temples`) are **not yet guarded** with `checkPermission` — needs `temples:write` / `temples:delete` guards added
- [ ] Reference data routes (`/api/admin/provinces`, `/api/admin/kings`, `/api/admin/styles`, `/api/admin/eras`) are **not yet guarded** — needs `temples:write` guard
- [ ] Password change in user edit modal — currently replaces hash if a new password is provided; no "confirm password" field yet

---

## Last Session Summary (March 4, 2026)

- Added dynamic RBAC system end-to-end
- Users page: activate/deactivate replaces delete
- Roles page: SF PermissionSet style
- API-level permission enforcement (`checkPermission`)
- UI nav permission filtering (layout.tsx)
- Admin layout: SF Setup style sidebar with icons, search, user card
- Header shows logged-in user name
- Admin list page table overflow fixed
- All TypeScript errors resolved (0 errors)
- README, wiki (Functional + Technical docs), and Releases.md all updated
- All changes committed and pushed to `origin/main`
