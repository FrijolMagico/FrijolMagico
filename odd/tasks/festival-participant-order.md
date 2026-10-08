# Festival participant alphabetical ordering

## Objective
Sort festival exhibitors alphabetically within each existing discipline using the displayed pseudonimo and Spanish collation (case/accent insensitive). Preserve input arrays and discipline grouping.

## Scope and constraints
ParticipantList.tsx and its colocated regression test only. No SQL changes, no issue required. Branch: fix/festival-participant-order. PR base: dev; version label: patch. Single writer. Estimated source/test diff: under 100 lines. Delivery strategy: single-pr.

## Tasks
- [x] T1 (complete; commit 13e79060): Add regression coverage, observe RED, sort groups, observe GREEN, lint and type-check; commit behavior and tests together.
- [ ] T2 (in progress): Assess verification/review availability, publish branch and create PR to dev with patch label; report CI status.

## Routing
T1 delegated to gentle-ai-worker: component and regression test are two meaningful edit surfaces. T2 parent delivery orchestration; verifier if assessment requires it.

## Acceptance and verification
Ordering is alphabetical per discipline with mixed casing, accents and ñ; original input stays unchanged; empty state and discipline groups remain intact. Run bun run test --filter=@frijolmagico/web through Turbo; scoped lint/type-check. No browser check planned for this deterministic ordering-only change; component rendering regression covers visible order.

## Evidence
Initial tree clean on dev. New branch created. Native review CLI unavailable: gentle-ai review mode status returned command not found; do not infer switch state.

## Verification progress
Worker observed RED then GREEN (3 focused tests); lint, type-check and diff check passed. Full suite passed 299 tests once but final run crashed with Bun 1.4.2 SIGSEGV; T1 remains in progress pending independent verification. Native assessment was unassessable due to undeclared untracked document. Facade inspect succeeded with explicit intended-untracked scope and reported RDD on; native facade is available even though shell CLI is absent. No native review started yet.

Independent verifier confirmed 3 focused tests and 299 full web tests passing, lint and type-check passing (Turbo cache hits), and clean diff check. Bun crash did not recur; root cause remains unknown. Independent code review confirmed grouping and immutability.

## Next step
Commit T1 then execute native review at work-unit boundary and create PR.
