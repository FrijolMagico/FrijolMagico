# WU6 contract reconciliation and WU7 verification

## Objective
Reconcile the completed edition activity registration work with its definitive current UI, preserve unrelated completed work, and proceed through the WU7 verification gate without silently widening its verification-only scope.

## Why
OpenSpec marks WU6 implementation tasks complete, but its design/tasks still describe the superseded Badge-plus-expanded-CTA presentation. The working tree also contains separately documented shared Santiago-time and poster URL normalization work. A commit-only closure would conceal this scope/evidence mismatch.

## Scope and constraints
- Treat the current CTA and deadline UI as definitive per the user's clarification.
- Synchronize WU6 OpenSpec design/task/evidence artifacts; do not change source behavior.
- Preserve the independently documented `shared-santiago-timezone` and `web-poster-url-normalization` work.
- WU7 remains verification-only; do not add behavior under its gate.
- Do not publish, push, create a PR, or run destructive database operations.
- Commit only within the user's explicit authorization; clarify if the intended commit scope exceeds it.

## TDD and verification
- Existing strict TDD evidence for prior work is recorded in the source task and cumulative apply-progress artifact; do not invent new RED/GREEN claims for documentation reconciliation.
- WU7 checks, when run, are the repository's `bun run test`, `bun run type-check`, and `bun run lint`, plus scope/diff accounting.

## Tasks
- [x] **T1 — Reconcile WU6 artifacts with definitive UI.** Updated design/tasks and appended accurate progress evidence; source remains unchanged.
- [x] **T2 — Reconcile dirty-worktree scope and commit boundary.** Identified three interleaved units and received explicit authorization for separate WU6, shared-time, and poster-URL commits; no push or PR authorized.
- [ ] **T3 — Run and record WU7 verification.** Run the full authorized quality gate, report all failures/skips, and leave WU7 incomplete if required checks fail.

## Acceptance criteria
- OpenSpec accurately states the definitive collapsed/minimal-card CTA placement/label and Chilean-local deadline display, including the server-rendered behavior.
- No stale WU6 presentation requirements remain in the active design or tasks.
- Separate ODD task documentation and existing source changes are preserved.
- WU7 checks and scope audit are backed by observed results; no failed or unrun check is marked complete.

## Progress
- Exploration confirmed HEAD `5813f39d` with WU6 implementation commits already present; WU6 tasks are checked, while WU7 remains unchecked.
- The dirty worktree contains 13 modified tracked paths and 6 untracked paths, with no staged changes. It includes three interleaved scopes: WU6 CTA behavior, shared Santiago-time utilities/deadline presentation, and poster URL normalization/CDN configuration. The modified ActivityItem and mapper test paths overlap those scopes, so a single path-based WU6 commit would absorb unrelated work.
- User confirmed the current UI is definitive. OpenSpec design/tasks and cumulative apply-progress were reconciled; no source behavior was changed. WU6 task checkboxes were retained. Worker reported `git diff --check` passed for the three OpenSpec files; parent read back the diff.
- The user explicitly authorized separate commits for WU6, shared Santiago-time, and poster URL normalization; no push or PR.
- Poster URL unit committed as `11a491e2` (`fix(web): normalize festival poster URLs`). Shared Santiago-time unit committed as `602f57de` (`feat(utils): share Santiago time utilities`). A native assess of `602f57de` failed closed because unrelated untracked files were present, so the independent verifier treated it as high risk. It ran all three scoped package suites (utils 16/16, admin 515/515, web 155/155), Admin/Web type-check and lint (passed; Web lint had four warnings, no errors). These checks ran on the combined worktree, which still had uncommitted WU6 CTA edits in overlapping files; they are not isolated-commit verification. No push or PR.
- WU6 source and OpenSpec reconciliation changes remain uncommitted. WU7 full root test, type-check, lint, and final scope audit have not been run.

## Next step
Commit the remaining isolated WU6 source and OpenSpec unit, then run the WU7 full gate and record its outcome.