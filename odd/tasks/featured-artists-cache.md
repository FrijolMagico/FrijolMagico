# Featured artists: prerender and tag-only SWR

Implemented and locally verified: tagged SWR refresh preserves valid prerendered cards when generation fails.

## Agreed scope

- Keep transactional random rotation; user accepts lack of idempotency. No DB schema/table/migration/outbox or separate snapshot changes.
- Commit DB rotation before invalidating only `FEATURED_ARTISTS_CACHE_TAG` with explicit SWR; no `/` invalidation.
- Function-level `'use cache'`, `cacheTag`, `cacheLife({ stale: 5 * 60, revalidate: 7 * 24 * 60 * 60, expire: Infinity })`.
- Throw on DB error/missing/empty data; remove no-featured message, preserve SQL/card presentation.
- Refresh is request-triggered. Success renews freshness; failure does not restart seven days.

## Worktree and delivery

Branch `refactor/database-staging-web-cache`. Peer delete-edition action/test diff (11 additions/3 deletions) preserved and excluded from commits. User explicitly authorized committing the existing implementation; no new source changes, branch changes or publishing.

Work-unit commits:
- `e3e7d55fee91abd628efd5f871885bff2df125bb` — `fix(admin): invalidate featured artists by tag with swr` (T1, source + tests).
- `0af624dbaca77393760b7afd2a2e11b5ebe0bcb4` — `fix(web): preserve featured prerenders with cache components` (T2, source + tests; verified T3 behavior).

Delivery `ask-on-risk`; feature diff216 additions/63 deletions =279 lines, excluding progress doc/peer14. Native slice293 lines includes unchanged peer diff and new component test. Original local DB hash/size/mtime unchanged. No remote DB/production cron/API calls. Verification used disposable local fixtures and localhost with dummy auth.

## Tasks

- [x] T1 — Tag-only SWR cron. **Implemented/verified; committed as `e3e7d55f`.**
  - Delegated multi-file writer + independent verifier. RED old path assertion then830 admin tests GREEN. Types/lint/diff-check passed after correcting introduced mock TS2345/TS7006 using production parameter type.
  - Tests verify transaction ordering, DB failure prevents invalidation and notification failure returns500; auth/rotation/zero-candidate behavior unchanged.
- [x] T2 — Cache Components DAL and valid rendering. **Implemented/verified; committed as `0af624db`.**
  - Delegated multi-file writer. RED old cache/empty-state then293 web tests GREEN; types/lint/diff-check passed and independently rerun.
  - Covers profile/tag, SQL primary pseudonym joins, returned/thrown DB errors, missing/empty data and card/error propagation. Parent spot-checked code and reordered Next import mechanically.
- [x] T3 — Positive build, failed-refresh retention and native review. **Verified locally.**
  - Independent verifier (assessment fallback/build/browser trigger), resumed after interrupted fixture verification.
  - Empty original DB fails homepage prerender; disposable fixture build generates static home with3cards/no empty text.
  - Empty runtime fixture: local SWR invalidation accepted, regeneration logs empty error, repeated home requests remain200 with prior3cards.
  - Fixture selection changed to4–6: first post-invalidation request serves old cards, second/subsequent serve new selection. Browser confirms3cards/profile links/no empty state.
  - Five browser404s classified by parent:3 nonexistent fixture photos and2 local Vercel Analytics/Speed Insights scripts; no render exception found.
  - Local request-driven behavior verified, not seven-day wall-clock waiting or deployed Vercel behavior. Owned server/browser stopped; no listener3107.
- [x] T4 — Clean owned verification outputs. **Completed after explicit human authorization.**
  - User selected `cleanup_generated_outputs`. Removed only the exact owned outputs below, including synthetic `.next`; preserved shared browser history. Parent verified all five targets absent, original DB hash unchanged, and diff-check passed.

## Review and evidence

- Explorers `mutbzb65-1-pxeb`, `mutcn0d0-2-whnq`. Writers `mutcz9h2-3-hqck`, `mutdb33m-5-y9v7`, `mutdi9v0-6-jqyq`. Verifiers `mutd60b7-4-kx11`, `mutdv0sw-7-wkis`, resumed `mutwe6ho-1-124k`.
- Positive build: existing workspace `next build` with explicit disposable fixture URL; artifact `apps/web/.next/server/app/index.html`. Original DB unchanged. Parent final `git diff --check` passed; only intended feature + preserved peer paths dirty.
- Native review medium/one reliability lens, lineage `review-97233cf526768cd9`, target `sha256:829f994dc02bd5995fc7fd960af602a41119720b6316bba62c3a15e962248d10`: **approved and exact acknowledgement completed**, authority burned, consumed revision `sha256:1f616fd36a23f83924d9ae143a9bcbbbdb542180b30a4a4ceabc85dc1b734d05`. No more STATUS/capture on consumed authority.
- Non-blocking advisory R3-001 WARNING at `apps/web/src/data/data-access-layer/featured-artists/getFeaturedArtists.tsx:39`; provider offered no correction. No finding text supplied in facade closure; do not invent its meaning or reopen review.
- ASSESS had untracked-scope limitation; conservative independent-verifier plan followed. Native closure does not authorize delivery.

## Cleaned verification outputs

- `/tmp/featured-artists-t3-runtime.elf9sm` and `/tmp/featured-artists-t3-runtime-path`.
- `apps/web/.next` (local verification build with synthetic artists).
- `.playwright-cli/console-2026-10-04T14-14-32-097Z.log` and `.playwright-cli/page-2026-10-04T14-14-34-229Z.yml` only; preserve all other shared artifacts.

## Next step

Existing implementation and verification committed on explicit user request; no push or publishing. User now requests read-only analysis of deployment-relative cache lifetime versus cron-only refresh and feasibility of executing the actual admin cron locally. Do not change the TTL or add a local runner yet. Production Vercel behavior and actual seven-day elapsed TTL remain untested; local SWR/profile evidence is recorded above. `next start` requires a new valid-data build because the synthetic verification build was removed. Parent owns full Engram mirror `odd/featured-artists-cache/tasks` and TODO projection.
