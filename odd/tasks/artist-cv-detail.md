# Artist CV detail (#139)

## Objective and scope
Build a wide, read-only artist detail modal in Admin, opened by the first row action. Reuse the artist profile and aggregated history already passed from `artistas/page.tsx`; fetch only active images and individual activity/exhibition entries with edition/event context on demand. Count each activity and exhibition once per edition, never its sessions. No CV file, editing, export, or collective participation. User selected ODD instead of the issue's obsolete SDD instruction.

## Constraints and acceptance
Keep server auth boundaries, preserve existing history editor, handle empty/loading/error states and accessible dialog interaction. Cache fetched data with appropriate artist and event/edition dependencies; invalidate after relevant image and participation writes, including old/new artist on reassignment. Do not broadly invalidate all Admin caches. Issue #139 has `status:approved`; PR target is `dev`. Branch: `feat/artist-cv-detail` from clean `dev`.

## Execution
- TDD: strict RED/GREEN/REFACTOR from gentle-ai skill when tests exist. Runner: `bun run test --filter=@frijolmagico/admin` (Turbo); type-check and lint scoped to Admin as applicable.
- RDD: off per session configuration. Delivery strategy: single-pr with user-approved size exception (~1,650 changed lines); no chain. Review workload exceeds 400 lines, disclosed and explicitly accepted.
- Delegation: multi-file writer trigger for each work unit; scoped `gentle-ai-worker`. Independent verification follows native `assess` plan.

## Tasks
- [x] A1 — Implement a minimal authenticated on-demand read contract for active images and artist activity/exhibition entries, sorted deterministically and counted by assignment ID; unit/contract tests for empty, duplicates/sessions and edition order. Route: delegated (multi-file). Evidence: RED missing modules, GREEN six new tests; after frozen install, full Admin suite 523 passed and Admin type-check passed. Cache mutation coverage remains A3; independent verifier confirmed this gap.
- [x] A2 — Add first row action, selected artist/store state and wide read-only modal reusing client profile/history; cover content, empty/loading/error states and no mutation controls. Route: delegated (multi-file). Evidence: RED missing status/total, GREEN 529 Admin tests; Admin type-check, lint and focused Prettier check passed.
- [x] A3 — Wire precise invalidation for artist image, activity/exhibition and event/edition dependencies and verify integration; test mutation-to-tag coverage and relevant Admin checks. Route: delegated (multi-file). Evidence: 540 Admin tests pass; `artistas:detalle` invalidated after 10 mutations (avatar, activities, exhibitions, participation, catalog); event/edition tags from A1 cover context changes; existing test expectations updated for new tag.

- [x] A4 — Refactor the read-only artist detail UI using existing shared shadcn components without editing primitives or installing packages; fix narrow-column overlap and long links, improve profile/history/timeline hierarchy and empty/loading/error states, preserve semantics and content. Route: delegated (dialog and test are two non-trivial files). Checks: RED/GREEN targeted test, full Admin Turbo tests, type-check/lint where feasible, user visually accepted before A6. Scope excludes data/cache and dashboard Turbopack incident. Forecast ~150–300 authored lines for this task; existing branch already exceeds one review slice.

- [x] A5 — Apply user-approved visual feedback: full-width portrait, count as participation title, responsive exhibition/activity columns with independently descending edition order across festivals, no badges or participation status, readable discipline labels and Spanish short dates, social links as link-only list. Route: delegated (dialog and tests). Checks: RED/GREEN, Admin tests, type-check, lint, Prettier; user visually accepted before A6. No primitive edits or installation.

- [x] A6 — Keep artist dialog header stationary with a bottom border and scroll only the content region. Route: delegated (dialog + test); checks: RED/GREEN, Admin tests, type-check/lint, Prettier and user visual review. Do not edit shadcn primitives.

- [x] A7 — Show per-column counts and reorganize participation cards: festival + edition title, discipline/activity subtitle, smaller localized date; retain existing notes and ordering. Route: delegated (dialog + tests), strict TDD, Admin checks; user visually accepted. No primitive edits.

## Progress and next step
A7 visually accepted by user ("Todo perfecto"): per-column singular/plural counts and festival/edition → participation label → smaller localized date hierarchy, notes preserved. RED new tests failed; GREEN 546 Admin tests pass, type-check/lint/Prettier pass; independent verifier reran 546 tests and found no concrete defect (edition-ID tie-break coverage remains a gap). A1–A5 complete; user visually accepted A4/A5 ("Todo ok"). A6 implemented: bounded dialog grid with bordered fixed header and internal scroll body; RED 1 new test failed, GREEN 546 Admin tests passed, type-check/lint/Prettier passed; independent verifier repeated 546 tests and read back layout. User accepted A6 visual behavior together with A7. Issue #139 now has `status:approved`; user explicitly chose a single oversized PR with size exception and authorized conventional commits and push. Commit/PR IDs pending.
