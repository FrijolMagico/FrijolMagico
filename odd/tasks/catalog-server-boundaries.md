# Catalog server boundaries

## Objective and constraints
Synchronous `/catalogo` shell, independent search/list/panel Suspense, shared server loading, compact payloads; no requests on panel opening. User adopted original page edits. Preserve unstable_rethrow, existing SQL/three remote caches/tags/lifetimes/DB routing, category derivation, ordering/filtering/pagination, `[slug]`, deep-link/pending panel selection, Spanish UI. No endpoints/client fetching/broad effect cleanup. Branch refactor/database-staging-web-cache; single-threaded writes. User subsequently authorized catalog commits; push/PR/publication remain unauthorized.

## Tasks and routing
- [x] T1: Compact contracts/projections, narrow search/list consumers. Delegated worker. Commit: 0efeaf33.
- [x] T2: Shared render loader, async wrappers/three boundaries, pending panel intent. Delegated worker. Commits: 930280ef, 2457f6e0, b96e51f3.
- [ ] T3 (in progress): Production build/prerender verified; regeneration after invalidation pending explicit target authorization. Independent verifier. No additional source change needed.

## Acceptance
No page catalog await; wrappers await shared getCatalogDataForRender inside individual boundaries. No new SQL/on-open fetch; search options/list ten fields/panel full data. Ordinary errors once in list, other wrappers null; Next signals propagate. Filter URL preserves artista. Real-render dedup not established by direct unit calls.

## Implementation evidence
- T1 RED missing projection module after runner-path correction; GREEN39 catalog tests/lint/types/diff. Approx309 lines.
- T2 RED missing wrapper modules, then Bun SIGSEGV (not behavioral assertion); final GREEN45 catalog tests/lint/types/diff. Approx270 lines,189 tests.
- cache(getCatalogData) alias shares render-scoped load, preserves original API. Scoped panel-init hook retains pending store selection; URL utility retains artista.
- Independent tests290/68files pass (catalog45/16files). Scoped ESLint/diff check and forced fresh tsc pass.
- Dev-browser panel/direct slug/details/collective verified, no catalog-data endpoint on open. Filter URL retention unit-tested (modal blocked attempted UI interaction). Owned browser closed; user server preserved.
- Native medium review22 source/test files668 diff lines: reliability approved and acknowledged review-4e53460cd93cc515, target sha256:8b96ce85fae4f9209ffaacaa3a60a11f3dcd5538c99c92c1d30ce17c04667ece. Authority burned, no correction. Initial consent expired without mutation; fresh start succeeded. Tracking doc excluded.

## Build and production verification
- Earlier forced build compiled but failed festival prerender SQLITE_BUSY at getActiveFestivalDisplay.ts9/10. No catalog success proved then; no source repair made.
- Subsequent user-authorized `bun run build --filter=@frijolmagico/web --force` PASSED compile/types/all57 static pages/sitemap. Catalog table○, artist slug◐. Fresh catalog HTML/RSC/meta generated; manifest PARTIALLY_STATIC; productionGET200 x-nextjs-cache:HIT.
- Owned production server port3017: search/city filter/results/panel/direct artista link worked. No separate catalog-data/API request on open; RSC/profile prefetch distinguished. Cache/render dedup not measured; no invalidation POST/DB writes.
- Fixture-image and analytics404s observed, unrelated to functioning interactions. Global installed playwright-cli fallback used after npx wrapper rejected Bun devEngines; ignored browser logs/snapshots left intact. Owned server/browser stopped and cleanup verified. Source diff hash unchanged during verification.
- Another session investigating active-festival transaction read-only; notified successful retry does not prove lock cause or eliminate contention risk.

## Delivery and next step
User-authorized commit slices: 930280ef loader/control signals (67 lines), 0efeaf33 compact browse contracts (270 lines), 2457f6e0 server Suspense integration (216 lines), b96e51f3 delayed panel selection (115 lines). Tests accompany behavior; no source changed while slicing. Combined native review remains evidence of the previously frozen full catalog candidate, not new individual review verdicts. No push/PR performed. Local build/prerender and production functional checks now pass. Remaining T3: authorize exact local/staging cache invalidation target and verify regeneration/no blocking-route afterward. No claim all deployments/runtime failures eliminated. Do not invalidate remote cache or edit DB without target-specific authorization.
