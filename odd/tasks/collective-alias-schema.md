# Collective alias and schema alignment

Scope: correct original fresh-install migration and integrate active artist pseudonyms into collective member lookup and persisted membership selection. Catalog remains one active entry per artist; no catalog changes. Historical implementation constraint: source-only, with no database mutation. That constraint was superseded only for the separately authorized staging reconciliation documented below; production remains untouched. Preserve unrelated worktree files.

TDD: no explicit mode configured; ordinary checks via `bun run test --filter=@frijolmagico/admin` and type-check. Delivery: ask-on-risk; estimated <400 authored lines. Branch: fix/collective-alias-schema.

- [x] Correct `agrupacion` initial CREATE TABLE to include nullable `deleted_at`; verified remote has column, local does not; `git diff --check` passed. Route: delegated writer. Commit: `8dca11cb`.
- [x] Integrate active aliases and name into collective member search and selection while preserving artist ID membership; focused tests and type-check passed. Integrated Admin/Database suites subsequently passed (798/109). Route: delegated writer. Commit: `eccdcfd0` (combined with choice flow).
- [x] Add membership pseudonym persistence migration, integrity triggers, schema, and focused database tests without applying migrations. Route: delegated writer; independent verify 76 DB tests and 3 type-check tasks passed. Commit: `854a764a`.
- [x] Integrate membership pseudonym choice/change in admin with ownership validation and tests. Focused tests, type-check and lint passed; later integrated Admin/Database suites passed (798/109). Route: delegated writer. Commit: `eccdcfd0`.
- [x] Integrated validation: transactionally reconciled staging and `bun run migrate:staging` passed; integrated Admin/Database suites passed (798/109). No production migration was run. Route: independent verifier.

At the initial source-only checkpoint, production had `agrupacion.deleted_at` while local.dev.db lacked it; local reconciliation was not authorized as part of that checkpoint. The staging reconciliation below was separately authorized and does not imply local or production mutation. Historical implementation note: new membership column requires its migration before deploying dependent code; the prior reference to migration 0026 and pending historical-divergence review is superseded by the current integrated evidence below. Admin commit has 811 additions/32 deletions across 13 files; reviewer should examine it in focused slices. Pre-existing unrelated odd/tasks/participation-status-visibility.md remains untracked and untouched. Existing unrelated untracked task file is out of scope.

## Current integration status

Implementation and staging validation are complete on the current integration branch: local integration HEAD contains `0027_collective_member_pseudonyms.sql` and journal idx27; staging was transactionally reconciled and `bun run migrate:staging` passed; integrated Admin/Database suites passed (798/109). This is not delivered to `dev`: remote `origin/dev` journal ends at `0026_talk_presenter` and does not contain migration 0027. `gh pr list` found no PR for `fix/collective-alias-schema` or `refactor/database-staging-web-cache`. PR creation and merge to `dev` remain pending; this is the current open delivery status, not a historical checkpoint.
