# Build database routing

## Objective
Local development/builds read existing pulled snapshots; CI alone creates, migrates and seeds an isolated SQLite database. Preserve Vercel remote bindings.

## Evidence
- Root dev/dev:real select local.dev.db/local.db; root build only calls Turbo.
- apps/web/.env.local:10 and apps/admin/.env.local:16 classify TURSO_DATABASE_URL as loopback:8080 (values redacted).
- Web raw SQL and Admin Drizzle share packages/database/src/client.ts via getTursoClient; connection refusal is not invalid SQL.
- CI creates/migrates mock.local.db but has no seed step.

## Constraints
No remote database reads/writes, automatic pulls, environment-file edits, snapshot migration/seeding/replacement, deployment, or merge. Preserve packages/database/local.db pre-0027 backup SHA256 df303f6031e585f8bb9a61cfc2b4d35ac0af4e250ea36871f25bb78559017958. User declined RDD for closeout. User explicitly authorized work-unit commits, push to the existing feature branch, and updating existing PR237. App-level Vercel build scripts remain unchanged. Local build uses staging snapshot by default, matching dev, with explicit Production snapshot option. Missing/incompatible snapshots fail clearly without remote fallback.

## Tasks
- [x] B1: Wire root local builds to existing snapshots with explicit Production snapshot command and regression coverage/docs. Verified; commit `2f93a36b`.
- [x] B2: Seed CI isolated migrated database using existing synthetic fixture; independently verified and included in the CI work-unit commit recorded in the delivery handoff.
- [ ] B3 (verification recorded; cleanup pending): Independent tests, types/lint, safe builds and snapshot integrity verified. Temporary-directory cleanup was blocked by a child safety layer; leave the reported `/tmp/frijol-ci-full.h2CP` pending and do not bypass safeguards. Commit: pending authorization.

## Acceptance and verification
Applicable deterministic changes use test-first: observed RED then GREEN, never invent evidence. Commands use root bun run test with workspace filter; no direct bun test. Full builds only target compatible local snapshots or disposable synthetic fixtures; never remote. Verify Vercel behavior structurally without deployment. Backup unchanged. Independent verification observed: focused six tests pass; disposable migrate/seed integrity check OK, foreign-key violations 0, 28 migration entries, 38 catalog entries and 7 event entries; uncached direct Turbo Web/Admin builds pass (Web metadataBase warning); root full Turbo tests pass (4 tasks, Admin 829 and database 114 tests; do not infer other totals); root type-check and lint each pass (3 tasks). Snapshot SHA remains e855fe4420cce88a9e16c2c1db0391e9eb8726d5c9839059f6e89a8b4ecea5be. Repository mock.local.db absent. Cleanup remains pending at `/tmp/frijol-ci-full.h2CP` because the child safety layer blocked it; do not bypass or delete.

## Current staging refresh authorization
User authorized read-only verification of staging-frijolmagico and, only if its schema/journal match current migrations, running the existing pull:staging to replace local.dev.db. No remote writes or migrations authorized. Parent found existing local.dev.db missing actividad.presenter_nombre, 27 journal entries/latest timestamp 1785715200000, latest hash not equal to current 0026 SQL. User deleted local.db; do not assume backup exists or recreate it. Verifier mur2kie8-8-eecl owns conditional audit/pull and readback. Vercel shared REVALIDATION_SECRET exists per user; project-only listing did not establish absence. User confirms dev branch credentials values updated to Production.

## Staging refresh evidence
Remote read-only named Turso CLI audit passed for staging-frijolmagico: 28 migration timestamps through 1785801600000, presenter columns, 0027 nullable RESTRICT FK and four triggers, integrity ok/FK zero. Hashes recorded by auditor; independent exact hash comparison pending. Existing pull exited 0 with generic credentials empty only in child process; local readback passed. local.dev.db: 696320 bytes, SHA256 e855fe4420cce88a9e16c2c1db0391e9eb8726d5c9839059f6e89a8b4ecea5be. No remote writes. Independent verification-only worker mur2xlge-b-mp7a now checks local hashes/schema, focused tests, types/lint and Web/Admin builds. B1 not yet accepted; CI seed B2 remains pending.

## CI seed proposal (read-only, not applied)
Keep fixed mock.local.db creation and migrate:ci; ensure SQLite CLI, then seed exactly that migrated file with sqlite3 -bail. CI build must invoke bun run turbo run build directly with DATA_SOURCE=local, absolute mock file URL and empty token: root bun run build now intentionally selects staging local.dev.db and would override the CI target. Tests retain the same mock target. Before adoption, verify full synthetic fixture against 0027 on a disposable database, foreign keys, nonempty catalog/festival route domains and unchanged migration journal; add focused workflow contract coverage. Scout mur2zy7j-c-ksxb changed nothing. User requested defining this in parallel; no parallel writes authorized.

## Independent local build verification
Worker mur2xlge-b-mp7a observed both Web and Admin builds PASS (uncached root snapshot build), lint PASS, four routing tests PASS, snapshot SHA unchanged and local hash/schema verification PASS. Web metadataBase warning remains. Scoped Web/Admin type-check FAILED on the newly added local-build-routing.test.ts: missing NODE_ENV in environment fixtures and assertion resolves typing. This is candidate-caused, not a pre-existing base defect. Original writer correction mur38a1w-d-gafq is restricted to that test, with observed type-check RED then GREEN and routing rerun required. B1 remains unchecked.

## Routing test correction outcome
Writer mur38a1w-d-gafq reproduced type errors, then fixed NODE_ENV fixtures and assertion typing in local-build-routing.test.ts only. Scoped Web/Admin type-check now PASS and focused routing tests 4/4 PASS. Combined local evidence: Web/Admin uncached builds PASS, lint PASS, types PASS, routing tests PASS, refreshed snapshot unchanged. Full repository suite not rerun. B1 behavior verified, but work-unit commit pending explicit authorization; no commit/push/merge performed. B2 remains a defined proposal, not implemented.

## CI implementation evidence
Writer mur3i64x-e-tfh7 applied workflow migration/seed/integrity/FK/nonempty slug gates and direct Turbo build on absolute mock file URL; tests same target. New workflow contract and disposable migration/seed tests observed RED then GREEN 6/6; database/Web/Admin types PASS, diff check PASS. Snapshot unchanged, local.db and repository mock.local.db absent. Parent readback confirms workflow steps; full CI-equivalent build not yet run. Fresh independent verifier fallback worker mur3uexm-f-iw3z now reproduces CI on a disposable synthetic DB and runs full build/tests/types/lint. No commit/push/remote writes. B2/B3 not checked off.

## Progress / next step
B1 source implementation returned: package.json, scripts/build-local.ts, packages/database/tests/local-build-routing.test.ts and packages/database/README.md. Writer observed RED (missing wrapper), GREEN 4 routing tests; database type-check passed. Parent readback confirms absolute snapshot URL, DATA_SOURCE=local, empty auth token and VERCEL=1 passthrough; current wrapper checks file existence only, not schema compatibility. Full builds and independent assessment pending; B1 remains unchecked. No commit/push, snapshots untouched by writer. B2 CI seed remains pending. User requested read-only Vercel environment audit before continuing: task mur1bds0-6-w6ui. Audit must use safe CLI metadata only, never credential files or decrypted secrets. Initial invocation command unknown; both app dotenv loopback settings and root build omission established.
