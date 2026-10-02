# Catalog SWR tag-only invalidation

## Objective and rationale
Remove redundant remote `/catalogo` path invalidation from the seven catalog/artist mutation actions identified in the approved point 1. Preserve tagged SWR coverage so both listing and artist detail can refresh without a forced listing-path regeneration.

## Authorization and boundaries
User explicitly authorized implementing point 1 and reviewing points 2, 3, and 4 only. Featured artists have special historical cron/weekly homepage behavior; do not alter that behavior without further authorization. Preserve immediate festival detail and canonical-slug routing invalidations, Admin-local tags, all database business rules, and existing homepage/festival-list paths. User subsequently authorized a work-unit commit and staging deployment, and explicitly chose a full merge (including additional release/dev history) into `refactor/database-staging-web-cache`. Do not push `fix/catalog-swr-tag-invalidation`. No Production deployment, database writes, invalidation POSTs, or PR authorized. RDD was declined for the closeout; do not claim native approval.

Branch: `fix/catalog-swr-tag-invalidation`, based on `b593a719b2949cecaaa5435b6d48b693f6a7c0a5`. Existing untracked `odd/tasks/stable-preview-config.md` belongs to prior configuration work and must be preserved.

## Tasks
- [x] T1: Implement tag-only catalog invalidation with test-first regression coverage. All seven approved actions changed; missing participation tag added on artist deletion. All seven derived existing test files approved and updated without removing cases or unrelated assertions. Worker observed GREEN full Admin 829 passed / 0 failed; focused 2 passed / 23 assertions, types/lint/diff checks passed. Independent verification completed under T2; work-unit commit remains pending explicit authorization.
- [x] T2: Independent verifier confirmed bounded source/test changes and executed full Admin tests 829 passed / 0 failed (3,175 assertions, 132 files), plus focused 2 passed / 0 failed (23 assertions), both Turbo cache misses. Diff check passed. Types/lint successful Turbo cache hits, not fresh verifier executions. Work-unit commit remains pending explicit human approval; no delivery or live SWR verification.
- [x] T3: Complete the bounded read-only review of points 2/3/4. Confirmed current featured cron rotates the DB and then invalidates its tag plus `/`; schedule is Monday 06:00 UTC (`0 6 * * 1`). Featured getter uses `unstable_cache` with `revalidate: false`, not a weekly TTL. Historical workaround rationale was not verified from Git history. Preserve cron/home path. Broad home/layout redundancy and safe removal of festival-listing paths remain unproven; preserve them pending dependency/runtime checks. Dynamic new-slug behavior was not verified. No changes applied to points 2/3/4.

## Acceptance criteria
- No remote `path: '/catalogo'` remains in the seven approved mutation actions.
- Tag invalidation retains SWR semantics and covers affected remote catalog caches.
- Immediate festival detail and canonical-slug invalidations are preserved.
- Featured artists cron/home and festival listing paths are unchanged.
- Deterministic regression tests observe RED before source edits and GREEN after, using root Turbo commands only (`bun run test --filter=@frijolmagico/admin`), never direct `bun test`.
- Verification evidence is observed, not inferred. No live SWR behavior claimed without a separately authorized deployment and human test.

## Evidence and progress
- Source audit: `/catalogo` paths are sent with catalog tags, default SWR mode. Web API independently performs `revalidateTag(..., 'max')` and `revalidatePath`.
- Listing and artist detail both reach `catalogRepository`, which composes separately tagged remote base, participation and edition-date caches.
- User reports featured cron previously needed homepage revalidation and weekly refresh; this remains a premise to verify, not permission to remove its path.
- Writer observed focused RED then GREEN: `bun run test --filter=@frijolmagico/admin -- ./src/shared/lib/catalog-swr-invalidation.test.ts`: 2 failures before changes, then 2 passed / 23 assertions.
- Initial full Admin suite: 803 passed / 26 failed / 829 total from legacy expectations. After authorized updates, writer observed 829 passed / 0 failed, 3,175 assertions across 132 files. Focused test separately passed 2 tests / 23 assertions. Type-check, lint and `git diff --check` passed. Independent verifier subsequently reproduced both test commands with cache misses.
- Current tracked diff: 14 files, 51 additions / 76 deletions, plus 42-line untracked source-contract regression test. Parent spot-checked artist-deletion source and behavioral-test diff: participation coverage added, canonical immediate and featured/home assertions retained.
- ASSESS returned unassessable because untracked files require a declaration; conservative high-risk plan requires writer self-verification and an independent verifier. Native review declined, no authority mutation or approval. Independent verifier `muretlhz-k-3rla` completed read-only verification: action/tag coverage consistent, unrelated test cases/assertions retained, full and focused tests executed successfully with cache misses. Type-check/lint were successful cache hits. Installed Turbo 2.10.8 lacks bundled `docs/README.md`; documented force syntax could not be verified, so no force execution was invented. Historical RED was observed by writer, not independently re-observed. No native approval or live SWR verification.
- Read-only review: featured cron `apps/admin/src/app/(cron)/api/cron/featured-artists/route.ts:26-47`, schedule `apps/admin/vercel.json:2-6`; featured cache `getFeaturedArtists.tsx:24-41` has no temporal expiry. Weekly schedule belongs to cron, not a proven automatic homepage refresh.
- Review limitations: no Git history inspection, production runtime test, full homepage/layout dependency inventory, or dynamic new-slug validation performed. None of these limitations authorizes additional path removals.

## Delivery continuation
- [ ] T4: Commit the verified source/tests/task document, then fully merge into `refactor/database-staging-web-cache`. Preserve unrelated untracked task document. Stop on merge conflicts; do not invent resolutions.
- [ ] T5: Verify the integrated tree before deployment.
- [ ] T6: Deploy Admin to staging Preview and confirm the stable staging alias. No Production or fix-branch push.

## Next step
Execute authorized commit/full merge, verify integration, then staging delivery. Live SWR measurement and restoration of the human test value remain separate pending work.
