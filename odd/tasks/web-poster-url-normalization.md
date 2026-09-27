# Web poster URL normalization

## Objective
Make web festival listing and detail presentation resolve relative edition poster keys to public CDN URLs, matching the existing admin behavior, without changing persisted/raw values.

## Problem and rationale
Admin derives a display URL with `getPosterUrl`, but web mappers currently pass raw `poster_url` values through. Relative object keys therefore do not become usable image URLs in web. Reuse the shared `@frijolmagico/utils/cdn` helper at the web mapping boundary; keep SQL and database contracts raw.

## Scope and constraints
- In scope: festival listing and detail mappers; focused mapper regression tests.
- Out of scope: database schema/queries, admin, cache invalidation, URL helper redesign.
- Preserve absolute HTTP URLs and null behavior through the existing helper.
- No push or PR is authorized. The user subsequently authorized separate local work-unit commits for this completed poster-URL unit and the adjacent WU6/shared-time units.

## TDD and route
- TDD: strict RED/GREEN/REFACTOR, resolved from the Gentle AI skill instruction to use strict TDD when tests exist; project test runner is Turbo (`bun run test --filter=@frijolmagico/web`).
- Route: delegated direct, one bounded writer; trigger: changes span both listing and detail mapper/test surfaces.
- Allowed edit surfaces: exact mapper and relevant mapper/repository test files under `apps/web/src/app/(sections)/festivales/` only.

## Tasks
- [x] **T1 — Normalize poster URLs in web mappings and cover behavior.** Added regression coverage for relative key, absolute URL, and null on listing and detail paths; observed RED; applied `getPosterUrl` at both web mapping boundaries; verified with the authorized web test command.

## Acceptance criteria
- Relative poster keys map to the same CDN URL returned by `getPosterUrl` in web listing and detail data.
- Absolute URLs remain unchanged and null remains null.
- No SQL, database package, admin, or shared helper behavior changes.

## Progress and evidence
- T1 completed by one bounded delegated writer; no unrelated files changed.
- RED: before implementation, 2 relative-key assertions failed with the raw key (`festivales/poster.webp`) instead of the expected CDN URL; absolute URL and null checks passed.
- GREEN: writer and independent verifier both ran `bun run test --filter=@frijolmagico/web`; 154 passed, 0 failed. Independent run was not cached. `git diff --check` passed.
- Independent verifier confirmed relative-key, absolute URL, and null cases for both listing and detail. Test assertions compare against `getPosterUrl`, so they specifically guard mapper integration rather than independently retesting the helper's URL-construction semantics.
- Native `gentle_review assess` was unavailable (`untracked files require an explicit declaration`); its returned plan required an independent verifier, which completed successfully. RDD is off.
- Changed files: `apps/web/src/app/(sections)/festivales/adapters/mappers/festivalMapper.ts`, its new `festivalMapper.test.ts`, `apps/web/src/app/(sections)/festivales/[slug]/adapters/mappers/festivalDetailMapper.ts`, and its `festivalDetailMapper.test.ts`.
- Commit: locally authorized by the user as a separate work-unit commit, with no push or PR.

## Next step
Report the verified fix. Cache invalidation remains explicitly out of scope.