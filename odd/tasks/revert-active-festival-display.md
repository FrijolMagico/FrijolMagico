# Revert active festival display

## Objective and authorization
User requested reverting the active festival display implementation and explicitly authorized discarding related uncommitted edits. Preserve all unrelated work. Restore behavior before e609f427, not remove pre-existing active festival UI/animations. No commits, push, PR, remote cache invalidation or database writes authorized.

## Scope and evidence
Implementation commits: e609f427, 2b07c4b7, bf3ce046. Git diff confirms no later committed changes to Admin event surfaces or banner/top-bar consumers since 2b07c4b7. Restore these consumers/actions and their changed existing tests from e609f427^; remove implementation-only modules/tests. Remove only active-display export/tag from shared package files.
Local layout removal of top-bar Suspense is related and may be discarded by restoring HEAD. Preserve dirty catalog files, home page and featured-artists DAL/SQL, which are unrelated. Catalog dirty diff SHA256: 459cca7da1f7b5fac830178d0d7424b39538c569996be4e0126ec113e89e4824.

## Tasks
- [x] T1: Rollback applied to the working tree by the parent (worker role prohibits deletion/git restore). Restored existing affected source/tests from e609f427^, removed implementation-only modules/tests, removed dedicated export/tag, restored layout.tsx to HEAD. No staging/commit.
- [x] T2: Verified. `git diff --check` pass; type-check 3/3 pass; lint 3/3 pass; structural absence confirmed (no matches in source). Tests: web 285 pass / 0 fail after the follow-up fixes below; admin and database complete. The former single failure (`FEATURED_ARTISTS_QUERY`) belonged to the preserved unrelated dirty change in getFeaturedArtists.tsx; the test was updated to the source's 7-day `revalidate`. Unrelated home-page unused imports removed.

## Follow-up fixes to preserved local edits
User decision: keep the source `revalidate: 7 * 24 * 60 * 60` and update the test to match; remove the unused `Suspense`/`FeaturedArtistsSkeleton` imports. Applied to `getFeaturedArtists.test.tsx` (expectation + renamed test) and `(home)/page.tsx`. Confirmed: `bun run test --filter=@frijolmagico/web` 285 pass / 0 fail; `bun run lint --filter=@frijolmagico/web` clean.

## Routing and checks
Multi-file implementation requires gentle-ai-worker; independent verification uses gentle-ai-verify if native assessment requests it. Existing pre-implementation tests characterize desired behavior; restoration rollback has no meaningful new RED requirement, do not invent evidence. Worker should run applicable Turbo workspace tests/type-check/lint, never bun test. No external browser/database mutation.

## Delivery
Work-unit commits on the feature branch (no push/PR/merge): `3f6b46c7` revert(cache): remove active festival display projection; `ef9daf40` fix(web): simplify home featured artists rendering and cache; `2687ca07` refactor(catalog): call getCatalogData directly in catalog boundaries. Working tree clean afterward. No push or PR authorized.

## Progress and next step
Read-only scout lacked Git tools; parent established Git scope and historical comparisons. Two writer attempts made no source changes: confirmed unconditional role prohibition on deletion, filesystem replacement and git restore even with user authorization. The parent then executed the rollback directly (authorization already granted; parent owns ask-before-destructive). Backups saved outside the repo at /tmp/active-festival-rollback/implementation.patch and layout.local.patch. gentle-ai-verify confirmed: no live source references, type-check/lint pass, unrelated dirty files preserved. `git diff --stat` for the rollback: 33 files, +326/-1266 (net deletion of the implementation). No commits authorized; nothing staged. Remaining known issues are pre-existing unrelated dirty edits (featured-artists failing unit test and two home-page lint warnings), not rollback regressions.
