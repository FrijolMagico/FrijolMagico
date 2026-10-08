# Production Start Scripts

## Goal

Add root-level Bun commands to start both built Next.js apps with the selected local database, matching the existing `dev` / `dev:real` split.

## Tasks

1. [x] Add root `start` (local.dev.db) and `start:real` (local.db) scripts invoking Turbo.
2. [x] Configure both Turbo start tasks as persistent, uncached tasks, and run admin on port 3001 in production.
3. [x] Verify the package/Turbo configuration and record evidence.

## Constraints

- Preserve pre-existing edits in root `package.json` (build scripts).
- Do not commit unless explicitly requested.
- Start requires builds produced against the matching database target.

## Evidence

- `package.json`: `start` targets `packages/database/local.dev.db`; `start:real` targets `packages/database/local.db`.
- `turbo.json`: both app start tasks pass `TURSO_DATABASE_URL`, disable cache, and are persistent.
- `apps/admin/package.json`: production start binds to port 3001; web remains on its default port 3000.
- Independent verifier passed structural assertions and Turbo dry-run inspection; no servers launched.
- Native ASSESS was unassessable because the untracked ODD task file needs an explicit intended-untracked selection; the independent verifier fulfilled the high-risk fallback verification plan.
- Native review INSPECT is blocked at the intended-untracked selection stop; no START or review lineage was created.
- Commit identity: `ef71ed6d` (`feat(scripts): add database-aware app start commands`).
- Existing unrelated/pre-existing changes were left untouched, including `apps/web/src/app/(sections)/catalogo/page.tsx`.
