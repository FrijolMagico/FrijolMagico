# Reconcile artist pseudonym migration history

## Goal
Make the artist pseudonym migrations follow the already-applied day-block registration migration without changing remote databases in this work unit.

## Evidence and constraints
- Turso `db-frijolmagico` has 24 migration records. Latest hash `d519e53c...` and timestamp `1785456000000` correspond exactly to day-block `0023_activity_occurrence_registration.sql`; `activity_occurrence.url` exists.
- This branch independently used `0023_artist_pseudonyms.sql` at the same timestamp and `0024_catalog_slug_aliases.sql` next. Neither pseudonym table is present remotely.
- Drizzle selects pending migrations by timestamp. Never run the current branch's migration sequence against remote.
- Preserve unrelated untracked `odd/tasks/participation-status-visibility.md`. No remote DB writes without separate explicit authorization. PR #222 already has an approved issue #221 and `size:exception`.

## Tasks
- [x] T1 — Reconciled migration files and journal: copied the byte-identical, already-applied day-block `0023` (SHA-256 `d519e53c...`); moved unchanged pseudonym SQL to `0024` and alias SQL to `0025`; timestamps increase strictly. Writer subagent was unavailable, so parent applied this scoped edit.
- [ ] T2 — Independently verify file hashes/journal order and migrate a disposable local DB with the real sequence; run scoped checks without touching remote data.
- [ ] T3 — Commit migration repair, update PR #222 and report deployment order and residual risks.
