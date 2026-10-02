# Talk presenter

## Objective
Allow a talk to optionally display one presenter, independent of edition participation. The presenter may be a person without an artist record (plain name), or an existing artist with a chosen active primary/secondary pseudonym. Linked artist and pseudonym names resolve dynamically; an unlinked person has no profile link. Public UI displays `Presenta: <presenter>` beneath the speaker.

## Scope and constraints
- Worktree: `feat/talk-presenter`, branched from `dev`; do not touch the dirty original worktree.
- Presenter is activity-level and talk-only, optional, editable/removable. Do not create edition participation for presenter.
- Existing artist/pseudonym link behavior must be inspected before implementation; do not conflate the domain entity `catalogo` with artists.
- Technical artifacts in English; public UI label in Spanish.
- TDD mode: off for ODD, explicitly chosen by user (normal tests); `openspec/config.yaml` strict TDD applies only to SDD. Runner: `bun run test` via Turbo, scoped as appropriate.
- Historical delivery plan at implementation start: the feature-branch chain to `dev` was explicitly selected and authorized by the user. The tracker branch `feat/talk-presenter` was draft/no-merge until children integrated; that was a point-in-time approval/delivery checkpoint, superseded by the merged PR status below.

## Tasks
- [x] TP-1: Map concrete schema, admin and web contracts; confirm implementation shape and tests. Route: delegated explorer (4+ files). Check: exact path and flow evidence.
- [x] TP-2: Add nullable presenter representation and migration with tests; retain linked artist/pseudonym referential integrity and free-person option. Route: delegated writer (multi-file). Check: focused database tests, schema/type checks. Commit: `c30f13c1` (database slice).
- [x] TP-3: Add admin create/edit/load workflow for free name or artist pseudonym selection. Route: delegated writer (multi-file). Check: focused admin tests and type checks. Commits: `14b95eb1` (admin contract), `d8ac979e` (admin UI).
- [x] TP-4: Expose presenter in public festival detail and render below speaker, linking only where existing artist link policy permits. Route: delegated writer (multi-file). Check: web query/mapper/component tests and type checks. Commit: `4fe9da14` (web slice).
- [x] TP-5: Run applicable suite, reconcile regressions and delivery/review status. CI checks for PRs #230 and #236 passed; chained PRs #231–#233 merged sequentially. Route: delegated verifier as assessment directs.

## Progress
Worktree created and read-only exploration completed. Product decisions clarified: one optional presenter; person without artist entity allowed; linked artist names follow updates; chosen secondary pseudonym supported. TP-1 complete: `actividad` is the independent detail; `participacion_actividad` owns speaker identity; admin detail actions and explicit web SQL require coordinated updates. TP-2 complete: `actividad` has nullable free-name or artist+pseudonym presenter with talk-only and ownership guards; migration 0026 and journal tests added. `bun run test --filter=@frijolmagico/database`: 75 passing; `bun run type-check --filter=@frijolmagico/database`: passed. TP-3 complete: admin create/edit/load and removal, including talk-only validation; admin tests 666 passing. Database tests 75 passing; database and admin type-check passing after fixing test assertions. TP-4 complete: public query joins linked pseudonym dynamically, mapping and talk-only `Presenta` beneath speaker; web tests 213 passing and web type-check passed. TP-5 verification record: CI checks for PRs #230 and #236 passed; full `bun run test`, `bun run type-check`, `bun run lint`, and `git diff --check` had also passed, with 6 pre-existing lint warnings outside scope and cached types. Source work-unit commits: `c30f13c1` database, `14b95eb1` admin contract, `d8ac979e` admin UI, `4fe9da14` web. Native assessment was unassessable because untracked files required explicit declaration; independent verification was completed. Historical checkpoint: no real DB migration or visual browser check was recorded then. The merged PR status below supersedes the checkpoint's delivery state; merging migration code does not establish that anyone applied it to production, and this record makes no such claim.

## Current delivery status

Issue #228 is CLOSED. PR #230 merged to `dev` with the database migration; chained PRs #231–#233 merged sequentially. PR #236 merged to `dev` and includes the talk presenter combobox, public web presenter rendering, and festival schedule. `origin/dev` contains `0026_talk_presenter.sql` and the talk presenter query/UI. TP-5 is complete; the former approval/PR-next-step is superseded by this merged evidence. Whether the production migration was applied is not established here; no actor or production execution is claimed. No visual browser check is claimed.
