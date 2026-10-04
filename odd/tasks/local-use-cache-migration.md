# Local use cache migration and Suspense cleanup

## Objective
Move the web app's server read caches from `'use cache: remote'` to local `'use cache'` so cached data joins the static shell (no runtime remote-cache roundtrip), then remove the Suspense boundaries that no longer cover a real runtime hole.

## Why
The project philosophy is static-first: almost nothing is request-dependent, and changing content should be cached and revalidated on demand. Verified read-only: no page/layout uses cookies, headers, searchParams, draftMode, connection or after, and there is no route-segment dynamic config. All nine readers are static-shell eligible, so Next docs state local `use cache` is sufficient; `use cache: remote` is only justified for request-time content or to protect slow/rate-limited backends. Remote adds network lookup and infra cost for no benefit here.

## Authorization and scope
User authorized: (1) replace `'use cache: remote'` with `'use cache'`, (2) then remove unnecessary Suspense. Do not change SQL, cache tags, cacheLife values, data source routing or public behavior beyond the directive and boundary removal. No push/PR/merge. Commit policy: work-unit commits on the feature branch per ODD; confirm with user before pushing.

## Readers to migrate (nine call sites, seven files)
- `apps/web/src/data/data-access-layer/festivals/getEditionDays.ts`
- `apps/web/src/data/data-access-layer/festivals/getActiveFestival.ts`
- `apps/web/src/app/(sections)/catalogo/adapters/queries/catalog-cache.ts` (three readers)
- `apps/web/src/app/(sections)/festivales/lib/getFestivalesData.ts`
- `apps/web/src/app/(sections)/festivales/[slug]/lib/getAdjacentFestivals.ts`
- `apps/web/src/app/(sections)/festivales/[slug]/lib/getFestivalBySlug.ts`
- `apps/web/src/app/(sections)/nosotros/lib/getAboutData.ts`

## Suspense boundaries under review
- `apps/web/src/app/layout.tsx:126` (TopBarInfoWrapper, fallback TopBarSkeleton)
- `apps/web/src/app/(sections)/catalogo/page.tsx:35,38,42` (search, list, panel)
- `apps/web/src/app/(sections)/festivales/[slug]/page.tsx:78` (FestivalNavigator, null fallback)
A boundary is only removed when the wrapped read completes in the static shell. If Next's blocking-route validation still requires it (for example a dynamic param not prerendered), keep it and record why.

## Tasks
- [x] T1: Migrated the nine readers to `'use cache'` (commit `0a30f799`). Verified: web tests 285 pass / 0 fail after updating the two `catalog-cache.test.ts` directive-contract asserts; type-check and lint pass; no `use cache: remote` remains in `apps/web/src`. Worker changed only the directive lines; cacheLife and tags untouched.
- [x] T2: Removed the five Suspense boundaries (commit `d26f1408`) (layout top bar, catalog search/list/panel, festival navigator), removed the orphaned `CatalogSearchSectionLoader` export, updated the two structural page tests (RED then GREEN), and rendered the cached reads directly. Verified: web tests 285 pass / 0 fail, type-check and lint pass, no `<Suspense>` left in app source. Parent deleted the now-orphaned `TopBarSkeleton.tsx` and the previously orphaned `FeaturedArtistsSkeleton.tsx` (dead fallback from the earlier FeaturedArtists boundary removal).
- [x] T3: Independently verified. Web tests 285 pass / 0 fail; type-check and lint pass; `bun run build --filter=@frijolmagico/web` succeeds with all 57 static pages and **no uncached-data, blocking-route or partial-prerender warnings**. Route summary: `/` and `/catalogo` static (`○`), `/festivales/[slug]` partial prerender (`◐`). Only `metadataBase` warnings and a benign "No featured artists found.". 0 matches for `use cache: remote`; no `<Suspense>` left in app source (one textual assert in a test).

## Result
All nine server reads now use local `use cache` and join the static shell. The five Suspense boundaries and their orphaned fallbacks are gone. No behavior change beyond cache placement and the removed boundaries.

## Routing and checks
Multi-file writes delegate to `gentle-ai-worker`. Use Turbo (`bun run ... --filter=@frijolmagico/web`), never `bun test`. Existing tests characterize behavior; directive change is not a new behavior, so no invented RED. Keep `cacheLife({ stale: 300, revalidate: Infinity, expire: Infinity })` and tags unchanged.

## Delivery
User authorized the three-commit split. Created `0a30f799` (`refactor(cache): use local use cache for server reads`) and `d26f1408` (`refactor(web): remove redundant Suspense boundaries`). This document is the third documentation commit. Push/PR/merge remain unauthorized.

## Progress and next step
Implementation and independent build verification completed. Fixed one trailing blank line detected by staged diff-check before the second commit; staged diff-check then passed. Browser checks and live on-demand regeneration were not run; build verification does not prove deployed invalidation behavior. Native review disposition remains pending for this slice. Next: review disposition and user-selected next task.
