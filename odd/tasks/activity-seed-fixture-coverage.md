# Activity seed fixture coverage

## Outcome
Development seed represents the dated day/block model without depending on migration-time URL backfill. Tests run the complete seed only on an ephemeral migrated database; never run the destructive `bun run seed` against a persistent or remote DB.

## Constraints
- Worktree `/home/strocs/dev/FrijolMagico-day-block-registration`, branch `feat/activity-day-block-registration` on `origin/dev` at `37976904`; no push or PR authorized. All existing stacked slices remain draft/no-merge.
- Seed runs **after** migrations; occurrence `url` must be seeded explicitly for registration examples. Keep `activity_registration.start_at/end_at` at activity scope, music unregistered, existing IDs and historical edition-day relationships intact.
- The five existing undated seed activities (`5–9`) receive the first day of their edition with no time, consistent with the authorized legacy-data policy; do not infer times from legacy fields. Every seeded activity must have a date.
- Include music date coverage, untimed occurrence, a single-block day, two same-day blocks and an additional day on one activity, distinct HTTPS registration URLs for blocks under one global window, and a nonregistered activity without CTA URL. The active-edition registration must expire in year 3000 so UI review remains possible. Avoid schedule overlap and ID collisions.
- Strict TDD disabled by user choice; ordinary tests through root `bun run test`/Turbo. Never `bun run seed`: it deletes `packages/database/local.dev.db`. Isolate Turso credentials during tests using a local SQLite URL and test-only token.

## Tasks
- [x] T1 — Complete required dates and musical fixtures. Add first-edition-day untimed occurrences for activities 5–9 and at least one dated music activity without registration. Add migrated-temp-DB seed contract tests for all-activity date coverage, edition day validity, music date, and FK integrity. Work-unit commit includes seed and tests. Independent verifier confirmed 49 activities with valid edition days, music without registration, FK integrity and 64 scoped database tests passing; no persistent seed run. Commit `d72a5e88` (182 added lines including plan).
- [x] T2 — Seed block registration and day grouping cases. Explicitly populate occurrence URLs for the two existing global registrations, give a registered activity distinct same-day block URLs plus a next-day block, retain a timed single-block and untimed block, assert shared registration window and unregistered/music URL absence. Extend the complete-seed contract tests, including the year-3000 global expiry. By explicit user preference, no further tests/type-check/lint were run; user will verify using the root Turbo commands. The active-edition activity 16 end date is `3000-12-31T23:59:59.000Z`. Work-unit commit recorded after creation.

## Initial evidence
- Read-only seed audit: 48 activities, 46 occurrence rows; IDs 5–9 lack occurrences. All existing occurrence inserts omit `url`. Two `activity_registration` rows exist. Migrations 0021–0023 precede seed execution, so their URL backfill does not apply to later seed rows.
- `packages/database/tests/band-migration.test.ts` provides a safe complete-seed harness using a temporary migrated DB; `scripts/seed.ts` is destructive for local.dev.db and is out of scope.

## Delivery
- T1 scoped tests: 64 passed before the user's no-more-checks request. T2 tests, type-check, and lint remain **pending user execution**; do not claim they passed.
- Keep fixture behavior and corresponding tests in each commit. Recalculate PR slices after work; do not exceed the accepted review exceptions by silently appending this work to a large slice. No production DB command, deployment, push or PR without separate approval.
