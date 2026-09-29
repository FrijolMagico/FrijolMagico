# Collective alias and schema alignment

Scope: correct original fresh-install migration and integrate active artist pseudonyms into collective member lookup and persisted membership selection. Catalog remains one active entry per artist; no catalog changes. Do not mutate databases or unrelated worktree files.

TDD: no explicit mode configured; ordinary checks via `bun run test --filter=@frijolmagico/admin` and type-check. Delivery: ask-on-risk; estimated <400 authored lines. Branch: fix/collective-alias-schema.

- [x] Correct `agrupacion` initial CREATE TABLE to include nullable `deleted_at`; verified remote has column, local does not; `git diff --check` passed. Route: delegated writer. Commit: `8dca11cb`.
- [ ] Integrate active aliases and name into collective member search and selection while preserving artist ID membership; focused tests and type-check passed; full admin suite has two failures outside this change. Route: delegated writer. Commit: `eccdcfd0` (combined with choice flow); closure blocked by full suite.
- [x] Add membership pseudonym persistence migration, integrity triggers, schema, and focused database tests without applying migrations. Route: delegated writer; independent verify 76 DB tests and 3 type-check tasks passed. Commit: `854a764a`.
- [ ] Integrate membership pseudonym choice/change in admin with ownership validation and tests. Focused tests, type-check and lint pass; admin suite 669 pass / 2 unrelated failures; no migrated integration test. Route: delegated writer. Commit: `eccdcfd0`; closure pending.
- [ ] Full admin suite remains blocked by two failing contracts for activity layout and participation selector (669 passed, 2 failed); files not touched by this branch. Temporary in-memory database migrated through 0026; Drizzle membership insert/update and alias lookup passed. No real database migrated. Route: independent verifier. Commit: pending.

Production has `agrupacion.deleted_at`; local.dev.db lacks it and requires separate explicit reconciliation, not part of these source-only tasks. New membership column requires migration 0026 before deploying dependent code. The remote migration sequence must be reviewed for historical divergence before application. Admin commit has 811 additions/32 deletions across 13 files; reviewer should examine it in focused slices. Pre-existing unrelated odd/tasks/participation-status-visibility.md remains untracked and untouched. Existing unrelated untracked task file is out of scope.
