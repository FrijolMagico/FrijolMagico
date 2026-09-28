# Activity day cards and per-block registration

## Outcome
A festival activity appears once per scheduled day. Its card lists that day's blocks; each workshop/talk block can have a separate registration URL while the registration window stays global. New and edited activities, including music, require at least one date; times remain optional.

## Decisions and boundaries

| Area | Rule |
| --- | --- |
| Public web | Day heading outside the card. One card per activity/day, blocks inside; omit “Bloque 1” for a single block and omit missing time rather than inventing it. Keep the music-specific card, without registration CTA. |
| Admin | Date/occurrence selector always in the third column. Registration switch reveals only the global start/end controls beneath it and per-occurrence URL inputs beside blocks. Music has dates but no registration. |
| Persistence | Migration 0023 adds nullable URL to occurrences and copies the existing global URL to each *existing* occurrence. Preserve occurrence IDs on edits and reject stale URL snapshots. Existing undated records and legacy URLs are not modified by this migration. |
| Legacy data | At the end, under explicit user approval and supervision, use Turso CLI to assign each undated activity the *first calendar day* of its festival edition, with **no time**, and copy its global URL to the new occurrence. Until then, undated activities stay stored but hidden from day groups. Never access or mutate a real DB without fresh approval. |
| Workflow | Worktree `/home/strocs/dev/FrijolMagico-day-block-registration`, branch `feat/activity-day-block-registration`, forked from remote-confirmed `origin/dev` at `42d8ab06`. Strict TDD disabled by user choice; use `bun run test` via Turbo, never root `bun test`. |

## Tasks and evidence

- [x] T1 — Database and per-occurrence registration persistence. Migration/schema/URL backfill, stable IDs, concurrent URL guard, music dates. Commits `c7b2ee58`, `471a8ab1`, `906ef316`; database **60** and admin **607** tests passed. User-authorized migration `0023` subsequently applied to `db-frijolmagico` under paused writes; see T4 verification.
- [x] T2 — Admin three-column form, switch-gated URL inputs, global window, edit hydration and client/server required-date validation. Commits `471a8ab1`, `906ef316`; admin tests, type-check and lint passed.
- [x] T3 — Public day/type groups and per-day activity cards, timed/untimed blocks, separate CTA URL per block, music blocks. Commits `a263d268`, `ff85412d`, `50e39b65`, `04d74fe1`; web **187** tests passed. Independent full `bun run test`, `bun run type-check`, `bun run lint` passed; 3 unrelated lint warnings. Parent re-ran web suite (187/187) and `git diff --check` successfully.
- [x] T4 — Supervised legacy data remediation. With explicit approval, exactly two SELECTs via Turso CLI on `db-frijolmagico` verified all six expected tables and found **6 undated activities**: IDs `6,7,8` in edition `14` (first day `2021-04-16`, 3 days) and IDs `11,13,20` in edition `20` (first day `2026-10-09`, 2 days). All have `invalid_day_count=0` and no legacy registration URL. Authorized read-only schema checks on `db-frijolmagico` confirm `activity_occurrence.url` absent, five old triggers still present (two workshop/talk guards and three destructive clear-on-* triggers), and remote Drizzle journal latest `1785369600000` = 0022; local journal lists 0023 at `1785456000000`. User-authorized `turso db export db-frijolmagico` saved a private pre-0023 snapshot outside the repo at `/home/strocs/.local/share/frijolmagico/backups/db-frijolmagico-pre-0023-20260928T165733Z.db` plus `-wal` (mode 600; parent directory 700). Local read-only SQLite integrity check = `ok`; snapshot journal latest 0022, 35 occurrences and 6 undated. Keep `.db` and `-wal` together; no restore rehearsal yet. User reconfirmed the no-write pause and authorized `cd packages/database && bun run migrate`. Before execution: exact host/token guard passed, file SHA-256 matched `d519e53c0f31c7db791ee06883eaad33652fc14de52a8f9020bc9461db084a17`, remote journal was 0022 with no URL column. Drizzle Kit reported success. Post-readback: URL column present, exactly one matching journal row for `0023`, 35 occurrences preserved, 20 occurrence URLs populated with zero legacy mismatches, only two new insert/update occurrence triggers remain, and 6 activities still undated before the backfill. With separate explicit user authorization, rechecked six activity types, first edition dates and absence of legacy URLs, then inserted all six date-only occurrences in one atomic Turso CLI statement: IDs `6,7,8` → `2021-04-16` (music); IDs `11,13,20` → `2026-10-09` (talks); `start_time`, `duration_minutes`, `url` all NULL. Post-readback: 41 total occurrences, 0 undated activities, 20 populated URLs, six exact new rows and one 0023 journal row. **No deploy, push, PR or authorization to resume other writes.**

## Delivery plan (not published)

User selected stacked PRs toward `dev`, all **draft/no-merge until the entire chain is complete**. User authorized local conventional commits, not push or PR creation. Coherent slices:

| Slice | Commit(s) | Authored lines | Review focus |
| --- | --- | ---: | --- |
| S1 | `c7b2ee58` | 220 | Database migration, schema and tests; task doc |
| S2 | `471a8ab1` | 616 | Admin creation, validation and date picker; approved `size:exception` |
| S3 | `906ef316` | 348 | Admin edit, ID/URL retention and concurrency |
| S4 | `a263d268` + `ff85412d` | 155 | Public data contract, time and CTA helpers |
| S5 | `50e39b65` | 381 | Day grouping and music blocks |
| S6 | `04d74fe1` | 536 | Workshop/talk card and tests; approved `size:exception` |

Each slice depends on its predecessor; intermediate checks ran against the combined worktree, **not isolated slice CI**. Do not merge partial slices. `origin/dev` advanced after branch creation (release/seed paths); recheck current remote and reconcile before any delivery without an automatic rebase.

## Next step

1. Remote schema migration and supervised date-only backfill are verified; keep the consensual write pause until the user and deployment operator explicitly decide whether to end it. The pre-0023 backup was not restore-rehearsed.
2. Reconcile the feature branch with newer `origin/dev` only after explicit authorization for history rewrite; reverify the final candidate. Push/PR creation, production deployment and resuming admin writes require separate user decisions.
