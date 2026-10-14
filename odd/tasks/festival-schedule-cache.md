# Festival schedule and active cache

## Objective
Implement issue [#247](https://github.com/FrijolMagico/FrijolMagico/issues/247) with minimal changes: preserve unconfirmed activities in historical editions and refresh only the active festival lookup weekly.

## Scope and constraints
- Branch: `feat/festival-schedule-cache-247` (based on local `dev`).
- Preserve unrelated untracked `odd/tasks/festival-lineup-layout.md`.
- Unconfirmed activities remain visible, at the very end of the schedule; show `--:--` at the hour position and exact Spanish copy `Horario por confirmar` in each affected card.
- Remove `is_edition_past` from mapper, types, props and schedule filtering; preserve unrelated end-date data.
- Change only `getActiveFestival` temporal revalidation to 604800 seconds; preserve tag/admin invalidation and unrelated cache policies.
- User additionally authorized `apps/web/src/data/site.json` top_bar.active=false to disable the outdated static fallback; dynamic festival topbar remains unchanged. Boolean edit verified by readback. Final verifier found two static-fallback test expectations failing (299 pass/2 fail); narrow wrapper-test correction is running, preserving dynamic-bar coverage. Browser checks pending.
- No database writes, cron, timezone-rule changes, registration behavior changes or publishing.
- User authorized commit, push and PR to dev with Closes #247. Issue approval was manually applied by user and verified remotely; agent did not apply protected label.

## Tasks
- [x] T1 implementation and writer self-checks: Preserve and present unconfirmed activities and remove cached edition pastness with regression tests. Work-unit commit: `2d81cca0b685f5bd14e41b24421f8feb67e17daa`.
- [x] T2 implementation and writer self-checks: Weekly active lookup (604800), populated/empty cache assertions and explicit exception in global boundary test. Work-unit commit: `0aa0a212893a0d2efa30e266af27ec54932baf04`.
- [ ] T3: Independent automated checks and native review completed; browser visual verification remains pending (local app unavailable).

## Acceptance and checks
- Past/current/upcoming editions have identical unconfirmed activity retention.
- Confirmed entries remain chronologically ordered; unconfirmed entries are last and use specified placeholders/copy; preserve dates and occurrence association.
- No remaining active `is_edition_past` field or props/filter.
- Only active lookup needs timed refresh after removing cached pastness.
- Applicable deterministic behavior tests follow observed RED, GREEN, then focused refactor checks; no invented evidence.
- Tests use root `bun run test --filter=@frijolmagico/web`, never `bun test`.
- Browser checks pending runtime availability; record skipped/blocked checks honestly.
- Refresh is demand-driven, not a hard seven-day wall-clock/browser-update guarantee.

## Evidence
- Production exact query measured three times: 85 rows_read, 0 rows_written each; weekly 4–5 calls ~340–425 reads per 30 days excluding cold misses/invalidations.
- Writer reports recovered RED: 299 passed, 1 failed before implementation (unconfirmed activities absent).
- Writer final GREEN: `bun run test --filter=@frijolmagico/web` passed, 301 tests, 0 failures. Intermediate assertion mismatches were corrected.
- Writer reports `bun run type-check --filter=@frijolmagico/web`, `bun run lint --filter=@frijolmagico/web`, and `git diff --check` passed.
- Independent verification and browser checks pending. User authorized continuation after pause.
- Initial native ASSESS was unassessable due to undeclared untracked files; independent verification required. Native INSPECT later resolved scope by excluding both untracked task docs.
- Independent verifier: 301 tests pass, git diff --check passes; type-check/lint pass from Turbo cache. No code findings.
- Browser check not performed: localhost:3000 connection failed; project declares no browser tooling. Visual verification remains pending, not substituted by unit tests.
- Native consolidated reliability review approved and exact acknowledgement burned authority for `review-9ff4a86acfb76ff3`, target `sha256:f0b9dc13e097ce219e3624dc9c6290e353e766f64d83d63880d05e620789a200`, consumed revision `sha256:54e9ea5f6bb9e52327ef57be93900203dae66df00078e764846cf859db2a558b`. Review does not authorize delivery. This approval covers the pre-topbar-toggle candidate only. New final candidate including site.json was offered native review; host returned consent-declined-this-candidate, no lineage created. Final independent verification is the fallback; decline is candidate-scoped.
- Recovery: original writer cancelled on parent shutdown. Git confirmed expected branch with 12 modified source/test files (+123/-163); changes preserved.
- User-authorized work-unit commits: T1 `2d81cca0b685f5bd14e41b24421f8feb67e17daa`; T2 `0aa0a212893a0d2efa30e266af27ec54932baf04`; topbar config/tests `ba1edd6bb0821f036d80ac3f512530e1be3e8e14`.
- Final independent verification: 301 tests pass uncached, type-check/lint pass from Turbo cache, diff check pass; no findings.
- Final corrected candidate native review was explicitly declined by host (no lineage), independent verification fallback. Prior approval does not cover final candidate.
- Remote dev comparison: 18 files, +185/-182 (367 authored lines). Local task documents remain untracked and are not published.

## Progress
T1/T2/topbar implemented, independently verified, committed and pushed. PR [#248](https://github.com/FrijolMagico/FrijolMagico/pull/248) created and readback-verified, base dev, Closes #247, labels type:feature and minor. HEAD ba1edd6bb0821f036d80ac3f512530e1be3e8e14. Final native review declined; earlier slice only approved. Required CI Lint & Type-Check & Build & Test pending. Browser verification pending and disclosed. Only two ODD docs remain untracked; unrelated doc preserved.

## Next step
Wait for required CI and complete browser visual verification before merge. No merge authorized/performed.
