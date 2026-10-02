# Participation status visibility

## Objective
Ensure public web surfaces show activity and exhibition participation only when `estado` is `confirmado` or `completado`; explain that rule beside admin activity/exhibition state selectors whenever the chosen state is hidden. New records continue to default to `seleccionado` and therefore remain hidden until their status changes.

## Problem
Public festival queries previously included participation records in every state. Public counts and exhibition-derived catalog metadata could therefore expose unconfirmed or otherwise non-visible participation. Database schema already defines the six lifecycle states and defaults both participation types to `seleccionado`.

## Why
Apply the clarified business rule consistently and assess remote historical statuses and indexes. The user authorized read-only remote analysis and separately approved the prior-edition and current-edition status updates, each with explicit scope.

## Scope
- Added the `confirmado` / `completado` allowlist to public festival detail, festival summary/count, and exhibition-derived public catalog query paths.
- Preserved `seleccionado` as the create default; admin lifecycle behavior and database schema were not changed.
- Added focused SQL query tests for the allowlist.
- New T6: add state-dependent Spanish helper text below activity and exhibition state selectors; show it only for values other than `confirmado` and `completado`. The create-activity form had no selector, so the user explicitly approved adding one with its existing `seleccionado` default.
- Inspected remote status aggregates, status-filter query plans, and index lists through `turso db shell db-frijolmagico` using read-only `SELECT`, `EXPLAIN QUERY PLAN`, and `PRAGMA index_list` only.
- No remote schema or index changes were performed. Status-only updates were made only after explicit user authorization: 3 prior music activities, 32 prior exhibitions, 59 current-edition exhibitions, and 30 selected current-edition activities. Any further data updates require separate approval.

## Constraints
- Remote target: `db-frijolmagico` only.
- Initial remote analysis used read-only operations only. After separate explicit user authorizations, guarded status-only updates changed exactly activity IDs 41, 42, and 43; 32 verified past-edition exhibitions; and selected activities/exhibitions in edition XVI according to the user's explicit scope. No other values were changed.
- Do not infer authorization for any additional modification from those narrowly scoped approvals.
- No SDD/OpenSpec requested for this change; repository OpenSpec config was referenced only to determine TDD mode.

## TDD and route
- Strict TDD is enabled by `openspec/config.yaml` (`sdd.strict_tdd: true`); scoped runner: `bun run test --filter=@frijolmagico/web`.
- T1 route: delegated writer; triggers were 4+ files to understand and 2+ non-trivial files to change.
- Verification route: delegated to `gentle-ai-verify` because the writer diff assessment was unassessable/high and independent verification was required.
- T6 route: delegated writer because four form files plus render tests require coordinated changes; strict TDD is enabled by `openspec/config.yaml`, with runner `bun run test --filter=@frijolmagico/admin`.

## Tasks
- [x] T1 — Apply status allowlist to public festival detail, summary counts, and exhibition-derived catalog query paths.
  - Evidence: added positive allowlist predicates to detail exhibitions/activities, each festival summary count, catalog category sources, and catalog edition history. Added assertions for each query. No admin/schema/default changes.
- [x] T2 — Verify focused tests and query behavior.
  - Evidence: writer strict-TDD RED/GREEN/TRIANGULATE/REFACTOR with `bun run test --filter=@frijolmagico/web`; independent verifier and parent spot check both passed 188 tests across 41 files (614 assertions reported), 0 failures.
- [x] T3 — Assess remote statuses and indexes; apply only explicitly approved prior-edition status updates.
  - Evidence: read-only aggregate queries returned status counts; `EXPLAIN QUERY PLAN` and `PRAGMA index_list` confirmed the existing join/filter indexes are used. After separate explicit approvals, guarded updates changed exactly three prior-edition music activity rows (IDs 41, 42, 43) and 32 prior-edition exhibition rows to `completado`; `RETURNING` and follow-up SELECTs verified all 35. No new index is indicated by the observed plans; no benchmarking or production load testing was performed.
- [x] T4 — Apply explicitly approved current-edition status changes.
  - Evidence: confirmed edition XVI (ID 20). A guarded update moved its 59 `seleccionado` exhibitions to `confirmado` (one was already confirmed); another guarded update moved its 30 `seleccionado` activities to `confirmado`. Three canceled activities were preserved. Follow-up SELECTs confirmed 60 exhibitions `confirmado`, 30 activities `confirmado`, 3 activities `cancelado`.
- [x] T5 — Create and approve the duplicate-checked tracking issue.
  - Evidence: confirmed the repository issue workflow and forms, searched open and closed issues, and found no duplicate. Created issue #212 using the Bug Report form with `bug` and `status:approved`; target-host readback confirmed title, body, and labels.
- [x] T6 — Add conditional state guidance to activity and exhibition admin forms.
  - Acceptance: create/update forms show the type-specific Spanish note directly below Estado for every non-visible state and hide it for `confirmado`/`completado`. Add an Estado selector to create-activity (default `seleccionado`) only as explicitly approved by the user.
  - Evidence: strict TDD RED/GREEN/TRIANGULATE/REFACTOR; render tests cover both entity-specific copy, create/update forms, hidden `confirmado`/`completado`, and visible `seleccionado`/`cancelado`. A writer run once timed out an unrelated test, then passed on retry (592 tests). Independent verification passed 592 admin tests, 188 web tests (614 assertions), both workspaces' type-check and lint, plus `git diff --check`.

## Progress
- T1: done; changes are in six public query/test files.
- T2: done; writer strict-TDD run, independent verifier, and parent spot check all passed.
- T3: done. Remote query-plan/index analysis was read-only; the separately approved 3 activity and 32 exhibition status values were then updated and verified.
- T4: done. Edition XVI state counts were preflight-guarded, updated within the approved scope, and verified afterward.
- T5: done. Issue #212 is open with `status:approved`; no duplicate issue was found.
- T6: done; user clarified entity-specific wording and approved adding the missing create-activity Estado selector with default `seleccionado`. Writer strict-TDD evidence and independent verification are complete.

## Verification evidence
- `bun run test --filter=@frijolmagico/web`: writer final run passed, 188 tests across 41 files, 0 failures.
- Independent verifier re-ran the command: passed, 188 tests, 0 failures, 614 assertions.
- Parent-required spot check re-ran the command: passed, 188 tests, 0 failures, 614 assertions.
- `gentle_review assess` after T6: returned `risk: unassessable`, `rddLine: off`, `nativeReviewOutcome: unknown`; native assessment refused because untracked files were not explicitly declared. Followed its plan with the independent verifier; no native review lifecycle started.
- Issue #212: https://github.com/FrijolMagico/FrijolMagico/issues/212 — open; readback confirmed title/body and labels `bug`, `status:approved`. Duplicate search covered open and closed issues; nearby #190 and #205 are unrelated.
- Remote target was connected by Turso CLI (`turso version v1.0.32`; `turso db shell db-frijolmagico`). Analysis queries were read-only; separately authorized, narrowly guarded status updates followed.
- Current remote participation counts after all authorized updates:
  - Exhibitions: 650 historical `completado`; in active edition XVI all 60 are `confirmado`.
  - Activities: 41 historical `completado`; in active edition XVI 30 are `confirmado` and 3 remain `cancelado`.
- Past-edition counts use `MAX(evento_edicion_dia.fecha) < date('now')` and include only participation rows linked to editions with at least one day:
  - Exhibitions after the authorized update: `completado` 650; no non-completed rows remain in date-qualified prior editions.
  - Activities after the authorized update: `completado` 41; no non-completed rows remain in date-qualified prior editions.
  - Before the authorized updates, total non-completed past-edition candidates were 35 (32 exhibitions and 3 activities). All 35 were updated only after their respective explicit approvals; no date-qualified prior candidates remain.
- Index plans for edition-scoped allowlists used `idx_participacion_edicion_edicion`; exhibition lookup used the unique participation-id index, while activity lookup used `idx_pact_estado` and the edition index. Catalog-style correlated checks used the artist index on `participacion_edicion`, the unique participation-id index on exhibitions, and `idx_pact_participacion` on activities.
- Remote index inventory confirms `participacion_exposicion` has indexes for status, discipline, and participation (the participation index is unique); `participacion_actividad` has indexes for status, activity type, and participation; `participacion_edicion` has an edition index and an artist index.
- Assessment: existing indexes support the inspected predicates and join shapes; the plans did not indicate a need for a new composite index. This is query-plan inspection, not a load benchmark.
- Remote data changes were limited to the explicitly authorized `estado` fields: 3 prior-edition activity rows, 32 prior-edition exhibition rows, 59 edition-XVI exhibition rows, and 30 selected edition-XVI activity rows. `RETURNING` and follow-up queries verified row counts and final states. The 3 canceled edition-XVI activities remained unchanged; no other data or schema values were changed.

## Delivery
- Committed the 12 intended app source/test files as `f1948f7d` (`fix(participations): filter public visibility by status`); this local task document was excluded.
- Pushed `feat/participation-status-visibility` to `origin`.
- Opened PR #214 to `dev`, linked with `Closes #212`, and applied exactly one type label: `type:bug`. Issue #212 remains open and has `status:approved`.
- GitHub Actions lint/type-check/build/test passed; both Vercel preview deployments passed. Production migrations were skipped (no migrations changed).
- The independent local verifier passed both workspaces' tests, type-check, lint, and `git diff --check`; web lint reported four unrelated warnings.

## Next step
Await review and merge of PR #214. No further database or GitHub changes are authorized or needed for this request.