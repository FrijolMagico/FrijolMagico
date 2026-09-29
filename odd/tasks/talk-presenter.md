# Talk presenter

## Objective
Allow a talk to optionally display one presenter, independent of edition participation. The presenter may be a person without an artist record (plain name), or an existing artist with a chosen active primary/secondary pseudonym. Linked artist and pseudonym names resolve dynamically; an unlinked person has no profile link. Public UI displays `Presenta: <presenter>` beneath the speaker.

## Scope and constraints
- Worktree: `feat/talk-presenter`, branched from `dev`; do not touch the dirty original worktree.
- Presenter is activity-level and talk-only, optional, editable/removable. Do not create edition participation for presenter.
- Existing artist/pseudonym link behavior must be inspected before implementation; do not conflate the domain entity `catalogo` with artists.
- Technical artifacts in English; public UI label in Spanish.
- TDD mode: off for ODD, explicitly chosen by user (normal tests); `openspec/config.yaml` strict TDD applies only to SDD. Runner: `bun run test` via Turbo, scoped as appropriate.
- Delivery: feature-branch chain to `dev`, explicitly selected and authorized by user. Four review slices (269, 274, 188, 179 authored lines); tracker branch `feat/talk-presenter` is draft/no-merge until children integrate. GitHub issue #228 is currently `status:needs-review`; do not open PRs until approved.

## Tasks
- [x] TP-1: Map concrete schema, admin and web contracts; confirm implementation shape and tests. Route: delegated explorer (4+ files). Check: exact path and flow evidence.
- [x] TP-2: Add nullable presenter representation and migration with tests; retain linked artist/pseudonym referential integrity and free-person option. Route: delegated writer (multi-file). Check: focused database tests, schema/type checks. Commit: `c30f13c1` (database slice).
- [x] TP-3: Add admin create/edit/load workflow for free name or artist pseudonym selection. Route: delegated writer (multi-file). Check: focused admin tests and type checks. Commits: `14b95eb1` (admin contract), `d8ac979e` (admin UI).
- [x] TP-4: Expose presenter in public festival detail and render below speaker, linking only where existing artist link policy permits. Route: delegated writer (multi-file). Check: web query/mapper/component tests and type checks. Commit: `4fe9da14` (web slice).
- [ ] TP-5: Run applicable suite, reconcile regressions and delivery/review status. Route: delegated verifier as assessment directs. Check: `bun run test`, `bun run type-check`, `bun run lint` or record blockers. Commit: pending if corrections.

## Progress
Worktree created and read-only exploration completed. Product decisions clarified: one optional presenter; person without artist entity allowed; linked artist names follow updates; chosen secondary pseudonym supported. TP-1 complete: `actividad` is the independent detail; `participacion_actividad` owns speaker identity; admin detail actions and explicit web SQL require coordinated updates. TP-2 complete: `actividad` has nullable free-name or artist+pseudonym presenter with talk-only and ownership guards; migration 0026 and journal tests added. `bun run test --filter=@frijolmagico/database`: 75 passing; `bun run type-check --filter=@frijolmagico/database`: passed. TP-3 complete: admin create/edit/load and removal, including talk-only validation; admin tests 666 passing. Database tests 75 passing; database and admin type-check passing after fixing test assertions. TP-4 complete: public query joins linked pseudonym dynamically, mapping and talk-only `Presenta` beneath speaker; web tests 213 passing and web type-check passed. TP-5 in progress: independent verifier reports full `bun run test`, `bun run type-check`, `bun run lint`, `git diff --check` passed; lint had 6 pre-existing warnings outside scope, types were cached. Source work-unit commits: `c30f13c1` database, `14b95eb1` admin contract, `d8ac979e` admin UI, `4fe9da14` web. Native assessment was unassessable because untracked files required explicit declaration; independent verification was completed. No real DB migration or visual browser check.

## Next step
Confirm issue #228 receives maintainer `status:approved` before any PR. Assemble feature-branch chain from tracker into four child branches and reverify clean branch diffs. Do not migrate real database or publish unapproved PRs.
