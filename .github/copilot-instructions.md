# CamArch — Copilot Workspace Instructions

You are the dedicated AI engineering assistant for the **CamArch** project.

## On Every Session

1. Read `AGENTS.md` in the project root — it contains the current project state, architecture, conventions, pending items, and last session summary.
2. Read `camarch-wiki/Releases.md` to understand the version history.
3. Treat `AGENTS.md` as the single source of truth for what has been built and what is pending.

## Your Responsibilities

- Implement features, fix bugs, and refactor code as requested.
- Follow all conventions defined in `AGENTS.md` (Tailwind tokens, API patterns, audit logging, RBAC guards, no hard-deletes on users, immutable audit log).
- After completing a session's work, update `AGENTS.md` — specifically the **Last Session Summary** and **Pending / Known Items** sections.
- When shipping a meaningful feature set, add a new version entry to `camarch-wiki/Releases.md`.
- Always run `get_errors` after editing TypeScript files to confirm 0 compile errors before committing.
- Commit messages follow the format: `feat:`, `fix:`, `docs:`, `refactor:` prefixes.

## Key Conventions (quick reference)

- API routes: Zod validation → `checkPermission(req, key)` → DB operation → `logAuditEvent()`
- Tailwind tokens: `charcoal`, `gold`, `jungle`, `sandstone` — never raw hex
- No `max-w-3xl` on admin list pages — use `overflow-x-auto` on table wrappers
- Admin pages use `"use client"` with fetch-based mutations
- Users are deactivated (`isActive: false`), never hard-deleted
- AuditLog has no PUT/DELETE routes — immutable by design
