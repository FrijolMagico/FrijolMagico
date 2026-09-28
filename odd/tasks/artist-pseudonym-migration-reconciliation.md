# Reconcile artist pseudonym migration history

## Goal
Make the artist pseudonym migrations follow the already-applied day-block registration migration without changing remote databases in this work unit.

## Evidence and constraints
- Turso `db-frijolmagico` has 24 migration records. Latest hash `d519e53c...` and timestamp `1785456000000` correspond exactly to day-block `0023_activity_occurrence_registration.sql`; `activity_occurrence.url` exists.
- This branch independently used `0023_artist_pseudonyms.sql` at the same timestamp and `0024_catalog_slug_aliases.sql` next. Neither pseudonym table is present remotely.
- Drizzle selects pending migrations by timestamp. Never run the current branch's migration sequence against remote.
- Preserve unrelated untracked `odd/tasks/participation-status-visibility.md`. No remote DB writes without separate explicit authorization. PR #222 already has an approved issue #221 and `size:exception`.

## Tasks
- [x] T1 — Reconciled migration files and journal: copied the byte-identical, already-applied day-block `0023` (SHA-256 `d519e53c...`); moved unchanged pseudonym SQL to `0024` and alias SQL to `0025`; timestamps increase strictly. Writer subagent was unavailable, so parent applied this scoped edit. Commit `957d6fb3`.
- [x] T2 — Verified copied and renumbered SQL hashes against source commits, monotonic/contiguous journal and remote `0023` checkpoint. Applied migrations `0000`–`0025` in a disposable local SQLite DB; seeded one synthetic artist to verify pseudonym backfill; confirmed target schema, triggers/indexes and `PRAGMA foreign_key_check`; DB removed. Updated test paths/journal assertions. Database suite passed (66 tests, 258 assertions, 8 files); type-check passed (Turbo cache); diff check clean. No remote writes.
- [x] T3 — Commits `957d6fb3` (reconciled SQL and journal), `f5c86c5b` (updated tests, disposable verification) and `b501c092` (rollout notes). Reconciled the remotely advanced feature branch by merging its `dev` update, reran monorepo tests (admin 644, web 210), lint (6 known warnings), and type-check; no build rerun as requested. Pushed branch and updated PR #222 with migration order. CI and actual remote migrations remain pending. Apply pseudonyms `0024` then aliases `0025` to the verified target DB before deploying app code; the Vercel preview needs that schema. No remote DB writes were performed.
