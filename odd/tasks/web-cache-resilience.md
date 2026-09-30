# Web cache resilience

Goal: Make public web cache regeneration safe and freshness event-driven, with granular invalidation aligned to actual query dependencies.

Context: Do not access remote Turso or Production Vercel. User explicitly authorizes Vercel CLI operations and touching any Preview environment only. The repository's local `packages/database/local.db` is available and reliable for local integration checks, but its data is not the latest production data. Use it only for local, non-destructive reads/tests; do not run migrations. Implement on the current branch and preserve unrelated worktree changes. User selected removal of all runtime mock datasets used by `apps/web`, including intentional development mock sources, and their exclusive generators. Preserve test mocks/fixtures and database seeds.

## Stage 1 — preserve valid data on read failures and remove runtime mocks

Scope:
- Public web database repositories must propagate read failures rather than turn them into mock data, empty successful values, or `null` where that would disguise an error.
- Successful empty query results remain legitimate empty results.
- Remove runtime mock datasets in Web and generators used exclusively by them. Keep test fixtures/mocks and database seeds.
- Cover error, valid-empty, and populated results with deterministic tests.
- No changes to cache lifetime profiles, admin-to-web invalidation policy, freshness classification, tag/query granularity, snapshots, or Turso/Vercel configuration in this stage.

Acceptance:
1. Catalog read failure propagates; successful empty base result stays empty; no mock is substituted.
2. Festival listing, festival detail, adjacent-festival, and About database read errors propagate rather than becoming empty/null/mock results.
3. Explicit runtime mock-source selections are removed for the affected Web repositories.
4. Runtime mock dataset modules and their exclusive synthetic-data utilities are deleted; tests, fixtures, seeds, and unrelated admin mocks remain.
5. Focused deterministic tests pass and the final diff does not include unrelated pre-existing changes.

Tasks:
- [x] Implement Stage 1 repository behavior and tests; remove approved runtime mocks/generators.
- [x] Run independent focused verification and record exact results.

Implementation result: database read failures propagate from catalog, festival listing/detail, adjacent festivals, About, and festival slug loading; successful empty results retain their domain-appropriate empty representation. Runtime Web mock source selections and mock-slug fallback were removed. Removed four runtime mock datasets and `apps/web/src/infra/__mocks__/mockDataUtils.ts`; test mocks/fixtures and DB seeds remain.

TDD evidence: RED observed (9 expected failures); GREEN observed in the delegated writer and independently reproduced after deletions.

Verification: `bun run test --filter=@frijolmagico/web` — 236 passed, 0 failed. Root `bun run type-check` and fresh `bun run lint -- --force` passed after cleanup of the 10 reported lint warnings. No remote Turso/Vercel access. Independent verifier confirmed Stage 1 behavior and scope.

Stage 1 work-unit commit: `e00a845d fix(web): preserve cached data on source failures` (17 files; runtime Web mocks removed, tests and this task document included). The preceding lint cleanup commit is `e139d7d4 chore(lint): clear existing warnings`. Neither commit was pushed.

## Stage 2 — event-driven cache lifetimes and invalidation (implemented; Preview remote-cache verification pending)

User-approved intent:
- Do not perform time-driven server revalidation/DB reads. A cached value remains usable until admin or cron explicitly invalidates it.
- Use `stale: 5 * 60` for the client router window (readable equivalent of 300 seconds); this is distinct from server revalidation.
- Target Cache Components profile: `cacheLife({ stale: 5 * 60, revalidate: Infinity, expire: Infinity })` for the nine remaining Cache Components scopes, using `'use cache: remote'` so serverless instances share entries. `Infinity` is the runtime-supported sentinel; preserve the explicit invalidation tags.
- Keep `unstable_cache` for featured artists; historical cross-instance invalidation trouble is documented and its cache mechanism must not be migrated blindly. Remove the 7-day timed TTL and use `revalidate: false`, retaining explicit tag invalidation.
- Canonical slugs are also a serverless special case: move the data read to `unstable_cache` with `revalidate: false` and `CATALOG_BASE_CACHE_TAG`; do not rely on the plain process-local `'use cache'` handler for a Route Handler. User accepts cache misses on new builds over dangerous timed DB refreshes; Next's `unstable_cache` persistence across deployments is preferred. Do not add Redis now; revisit only if the managed Next/Vercel Data Cache proves insufficient.
- The semantics discussed are explicit-event invalidation followed by stale-while-revalidate on the next request: serve the old value while a background refresh runs. This is not `cacheLife('max')` and must not introduce periodic reads by time.
- `revalidateTag(tag, 'max')` is distinct from the `cacheLife('max')` profile. Use it as the explicit invalidation policy: it is called only on an admin/cron event, marks tagged data stale, and allows stale-while-revalidate on a later request. The current endpoint's `{ expire: 0 }` blocks the next request for fresh data. Preserve route-path invalidation separately.

Pre-implementation Stage 2 baseline:
- Public cache scopes include 3 catalog `use cache` reads, About, festival listing/detail/adjacent data, active festival, edition days, canonical catalog slugs, and featured artists (`unstable_cache`).
- Before Stage 2, canonical slugs had `cacheLife({ stale: 0, revalidate: 45, expire: 60 })` and a separate manual 60-second age check that directly queried DB; both timer-triggered paths were removed.
- Critical serverless caveat: `getCachedCanonicalCatalogSlugs()` is a Route Handler whose HTTP response is `Cache-Control: no-store`; this prevents CDN response caching but does not preclude internal data caching. Its current plain `'use cache'` uses Next's default in-memory handler, not reliable/shared storage across serverless instances. `cacheLife(Infinity)` controls age, not storage durability. The chosen implementation is `unstable_cache`/Next Data Cache, which persists function results across requests/deployments and is invalidated by the existing tag. `'use cache: remote'` is an alternative but is build-scoped and had an undocumented invalidation issue in repository history. Exact deployed Vercel behavior remains unverified. Preview-only CLI access is now authorized, but no Preview deployment exists for the current candidate branch.
- Before Stage 2, featured artists used `unstable_cache` with a 7-day TTL; the weekly cron rotates data then invalidates `FEATURED_ARTISTS_CACHE_TAG` and `/`. The TTL is now disabled.
- Before Stage 2, the admin→web endpoint invoked `revalidateTag(tag, { expire: 0 })`; it now uses explicit SWR (`'max'`) and keeps optional `revalidatePath(path)` separate. Path invalidation refreshes the home route HTML/RSC on a later visit; it does not inherently query every underlying data source.
- Shared tags mean freshness exceptions and tag redesign are deferred to Stages 3–4.

Historical evidence for featured artists:
- Commit `5b38ef5a` removed `'use cache'` to diagnose a revalidation issue.
- Commit `81747475` added path `/` invalidation and reverted from `'use cache: remote'` to `'use cache'`.
- Commit `3d23d538` switched to `unstable_cache`; commit rationale explicitly cites cross-instance invalidation on Vercel and serverless SQL loading.
- Commit `77ad499a` extended the TTL from one to seven days to reduce unnecessary regeneration.
- This establishes the previous observed problem and rationale, but not the exact root cause or current Vercel behavior. No Vercel runtime verification was performed.

Stage 2 acceptance candidates:
1. Every public DB-backed cache scope has no time-based server revalidation or manual TTL-triggered query.
2. Tagged cache refreshes are triggered by explicit admin/cron invalidation; invalidation calls alone do not query DB. Initial/cold/new-build cache misses still require a DB read to populate a value.
3. Repeated invalidations without requests leave regeneration deferred; the next request refreshes only tagged data entries it needs (not “one query total” if multiple entries are involved).
4. General on-demand SWR returns old data while regeneration runs; the immediate/blocking mode remains available for the content policy set in Stage 3.
5. Featured artists retain `unstable_cache` with the existing tag and `revalidate: false`; unit tests verify its options and the endpoint's explicit SWR call. Actual cross-instance Vercel cache behavior remains unverified and is not claimed.
6. `revalidatePath('/')` updates the route output independently from the tagged data entry; avoid assuming route invalidation forces all DB data to be re-read.
7. Canonical-slug cache storage is shared across serverless requests/instances, or the chosen backend's cold-start/deployment cache-miss behavior is explicitly accepted; an infinite lifetime on a process-local cache is insufficient.

Out of Stage 2: deciding which public content needs faster freshness (Stage 3), changing cache tags/query granularity (Stage 4), snapshots and remote Turso/Vercel operations. Local `packages/database/local.db` may be used for read-only integration checks; its content is reliable but may lag production.

Local cache smoke result: launched `turso dev --db-file local.db`; launched Web with explicit `DATA_SOURCE=local`, empty `VERCEL_ENV`, `TURSO_DATABASE_URL=http://127.0.0.1:8080`, empty auth token and a local-only revalidation secret. Issued only GETs and one authenticated local POST invalidation; no DB writes, migrations, Turso remote, or Vercel access. A temporary API route invoked `getCachedCatalogBaseRows()` and was removed after the test. First GET returned 200/86 rows; second GET returned 200 from cache. POST for `catalogo:artistas:base` returned 200; debug logs show tag update (`expire: 31536000`), next read saw a stale tag and refreshed, following read hit the updated cache. Crucial limit: logs show local Next 16.2.12 sets the `'remote'` handler `from default`, i.e. default in-memory handler. This validates same-process cache/SWR with local DB, not Vercel remote sharing or cross-instance tag propagation.

Stage 2 task sequence:
- [x] Add test-first coverage and apply the infinite-server-lifetime profile to all nine non-canonical-slug Cache Components scopes; update existing unit-test `next/cache` mocks so they provide `cacheLife` when those functions run outside a Next cache runtime.
- [x] Change the web invalidation endpoint to explicit-event SWR (`revalidateTag(tag, 'max')`), preserving independent `revalidatePath` handling; remove the seven-day featured-artists TTL while keeping `unstable_cache` and its tag.
- [x] Move canonical slugs to `unstable_cache` with no time TTL; remove the 45-second profile and manual 60-second read; close the `persist-artist-avatar.action.ts` invalidation gap for successful activation of a catalog row and test it.
- [x] Convert the nine remaining scopes from plain `'use cache'` to `'use cache: remote'`, preserving `cacheLife` profiles and tags; Preview remote-handler/tag-propagation verification remains pending a candidate Preview deployment.
- [x] Rerun full Web/Admin tests, type-check, lint, and diff check after the remote directive migration.

Execution progress — Task 1 complete: Added `cacheLife({ stale: 5 * 60, revalidate: Infinity, expire: Infinity })` to all nine non-canonical-slug DB-backed `'use cache'` scopes. Tags and query behavior are unchanged. Added a focused assertion and updated six existing `next/cache` test mocks with no-op `cacheLife`; production code was not weakened for tests. TDD: RED observed (new profile assertion failed before implementation); an initial full-suite run then exposed 23 test harness failures outside Cache Components runtime, repaired with test-only mocks; targeted GREEN (29 tests across seven files) and independent full Web Turbo GREEN (237 passed, 0 failed, 840 expectations; 54 files).

Task 2 complete: The web revalidation endpoint now uses `revalidateTag(tag, 'max')` after authorization; path revalidation remains independent. Featured artists retain `unstable_cache` and `FEATURED_ARTISTS_CACHE_TAG` with `revalidate: false`. TDD RED was observed for both old semantics; focused GREEN passed (5 tests/17 assertions), then independent full Web Turbo GREEN passed (241 tests, 0 failures, 853 assertions; 55 files).

Task 3 complete: Canonical slugs now use `unstable_cache` with `CATALOG_BASE_CACHE_TAG` and `revalidate: false`; removed both the 45-second cache profile and manual 60-second age-triggered query. Kept the route response `Cache-Control: no-store` and its fail-closed 503 behavior. `persistArtistAvatarAction` now requests best-effort Web invalidation when an inactive catalog row is activated, including an idempotent committed-avatar retry. Tests cover cache options/no age refresh, failure handling, activation, and retry. TDD RED was observed for the missing avatar invalidation; GREEN: independent full Web suite 241 passed/0 failed and Admin suite 718 passed/0 failed. Vercel Preview cross-instance behavior remains unverified; no DB or remote service was accessed during these checks.

Final local checks after remote migration: Web Turbo suite 241 passed/0 failed (849 expectations, 55 files); Admin Turbo suite 718 passed/0 failed (2,532 expectations, 122 files); `bun run type-check` and `bun run lint` each passed (3 Turbo tasks); `git diff --check` passed. No remote service or local database was accessed during these checks.

Stage 2 work-unit commits on `refactor/database-staging-web-cache` (not pushed):
- `ad893684 feat(web): share cached reads across instances`
- `934c297e fix(web): use event-driven tagged cache invalidation`
- `e8d3906d fix(web): cache canonical slugs by catalog tag`

Serverless follow-up completed locally: the nine remaining functions use `'use cache: remote'` with their existing infinite `cacheLife` profile and tags. User accepts cache misses on new builds. Local tests verify directives and profile declarations, but cannot establish Vercel's remote handler and cross-instance tag propagation for this candidate. Preview-only CLI access is authorized; that check remains pending a candidate Preview deployment.

Known risk: admin→web invalidation is often best-effort. With no TTL fallback, a failed event delivery can leave an entry stale until a later successful invalidation. Do not introduce a time fallback to mask this; report it for a separate reliability decision.

## Resume state

Current branch: `refactor/database-staging-web-cache`. Stage 1 is committed. Stage 2 implementation and local checks are complete; its work-unit commits are recorded below. Stage 3 freshness policy is selected; Stage 4 writer/tag audit and the final consistency review remain pending. Vercel remote-handler/tag-propagation verification is authorized for Preview only, but no Preview deployment exists for this candidate. Cache misses still query DB to populate an entry. Use `packages/database/local.db` for read-only integration tests when useful, remembering that its data may lag production. Do not access remote Turso or Production Vercel, or run migrations. Preserve unrelated local `odd/tasks/catalog-batched-dal.md` and `odd/tasks/participation-status-visibility.md` work.

## Stages 3–4 planning state (not implemented)

Stage 3 is to choose post-invalidation response freshness per user-visible content, not to reintroduce time-based revalidation. User decision: after explicit invalidation, immediate/blocking freshness is required for canonical slugs, festival publication/detail, and active-festival dates/venue. Festival listing and adjacent-festival results, catalog, featured artists, and About use SWR by default. `FESTIVALES_CACHE_TAG`, `EVENT_CACHE_TAG`, and `EDITION_CACHE_TAG` overlap across festival detail/list/adjacent, active-festival, and edition-day reads; differing policies may require Stage 4 tag separation before implementation.

Stage 4 is to map every query result to its tags, route outputs, and all admin/cron writers. Read-only audit confirmed catalog base/participation/edition-date reads use separate tags; canonical slugs share the base tag; festival detail/adjacent/active/edition-days overlap event/edition/festival tags; featured cron invalidates its tag and `/`. The audit is still not exhaustive, but it confirmed concrete invalidation gaps: Web About is tagged `NOSOTROS_CACHE_TAG`, while Admin's organization update writes the same organization row and only invalidates `ORGANIZATION_CACHE_TAG` locally; no Admin→Web invalidation is present. Festival list uses only `FESTIVALES_CACHE_TAG`, while event/edition publication/name/date writers invalidate `EVENT_CACHE_TAG` and/or `EDITION_CACHE_TAG`, so list membership/order/fields can remain stale indefinitely. Adjacent festivals also consume event names but event-name writes do not invalidate their `FESTIVALES`/`EDITION` tags. Featured output includes artist identity/social/image fields; some artist/avatar writers invalidate only catalog base, not `FEATURED_ARTISTS_CACHE_TAG`. These require writer-by-writer confirmation before patching. Admin also has a distinct `EDITION_DAY_CACHE_TAG`; do not treat it as equivalent to Web's `EDITION_CACHE_TAG`.

### Stage 4 design draft (not implemented)

The selected freshness split requires isolated cache tags, because existing shared tags connect immediate and SWR scopes. Proposed tag boundaries (names provisional until writer audit): canonical slugs; festival detail; active festival; Web edition days; festival listing; adjacent festivals. Keep catalog base/participation/edition dates, featured artists, and About on their own SWR tags. Admin writers must invalidate every affected public tag; Admin-local `updateTag` is not a substitute for Admin→Web invalidation. Preserve `revalidatePath` separately where route output requires it.

The current cross-app API transmits only `tag` and optional `path`, and the Web receiver always uses `revalidateTag(tag, 'max')`. Next 16.2.12's installed type accepts `{ expire: 0 }` for an immediate next-request refresh. Proposed transport is an explicit validated mode (`swr` default → `'max'`; `immediate` → `{ expire: 0 }`) carried alongside each tag; do not infer urgency from undocumented behavior. This needs tests and end-to-end verification after the exact mutation→tag matrix is confirmed.

Consistency review: no timer-based refresh is reintroduced; immediate applies only after an explicit invalidation and only to user-selected scopes. Shared tags currently violate the desired split; canonical slugs share catalog base. Best-effort Admin→Web delivery can still fail, so “immediate” is conditional on successful delivery and may leave indefinite stale data otherwise. Confirmed gaps above mean Stage 4 needs both missing-writer fixes and tag-mode separation. The source audit remains incomplete for all event/edition/day writers and conditional/local-vs-remote branches; these are blockers to calling Stage 4 complete or implementing its full matrix. Festival list/adjacent intentionally remain SWR even after publication/detail changes.

### Staging validation runbook (prepared, not executed)

Prerequisites: authorized Vercel staging deployment with the same cache directives/handler as the candidate; known deployment/build ID and function regions; a designated staging-only test record or isolated probe; permission for any staging DB mutation; and logs/metrics access. User explicitly authorizes Vercel CLI use and any Preview environment, never Production. CLI 59.26.0 is installed; `.vercel/repo.json` maps `frijolmagico` and `admin-frijolmagico`. Preview-only `vercel list` queries found no deployments for branch `refactor/database-staging-web-cache` in either project; existing Ready previews belong to other branch refs and do not contain the uncommitted Stage 2 candidate. No deployment, environment pull, production query, or DB write was made.

1. After Stage 3/4 implementation is independently tested and deployed to staging, run a temporary secret-protected, no-store probe whose internal function uses `'use cache: remote'`, a unique run-scoped tag, and returns a generated timestamp; return a non-cached per-process instance ID separately. Never expose credentials or use live content tags.
2. Warm the probe from two verifiably distinct function instances. Same cached generation with different instance IDs demonstrates sharing; if distinct instances cannot be proven, mark the result inconclusive rather than passing it.
3. Invalidate the unique tag through the authenticated Web endpoint. For an immediate tag, the first following read must wait for and return a new generation. For an SWR tag, the first read may return the prior generation while revalidating; a subsequent read must return the new generation. Capture request IDs, instance IDs, timestamps, deployment ID, and logs.
4. Separately exercise actual event-driven paths using a designated staging-only record: publication/detail/canonical URL/active dates and venue must reflect changes on the first post-invalidation read; list/adjacent, catalog, featured and About must follow the approved SWR expectation. Confirm both Admin mutation delivery and remote tag receipt; do not substitute the generic probe for these checks.
5. Remove the probe, clean up the staging record if one was created, invalidate only its unique tags/paths, and verify cleanup. Do not use live public tags for probe cleanup.

Local Stage 2 smoke passed as recorded above; it exercised only one local process. Production/staging remote-handler and cross-instance validation is a separate pending task.
