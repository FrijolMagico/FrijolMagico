# Shared fissure composition and footer reveal — implementation handoff

## Status and authorization
Proposal approved for persistence, NOT implemented. User requests another session apply it. This session may commit the plan and previous banner work only. Future executor must reconcile current code/memory and obtain/confirm implementation intent before source mutations. No footer source changed.

## Goal
Extract a shared clipping/edge composition used by thin banner/footer adapters; stop footer fissure distortion; enable a CSS-only stationary footer progressively revealed behind scrolling site content, subject to structural proof. No GSAP, CSS animations/timelines, JS scroll compensation, duplicate interactive children or arbitrary spacer hacks.

## Current branch and related work
Branch feat/web-fissure-banner-first. Prior work: homepage banner -> hero -> featured artists, home main -mt-12 compensates root body pt-12, info topbar hidden only on /. Banner API explicit landscape/compact fixed(height) or square; content mode removed by user. Podcast420 desktop/360 compact; festival640 desktop/square compact with840 internal geometry reference. Full fixed child inside normally moving mask; shared wide mask/outline/blocker mapping corrected after mobile screenshot. Final extra browser check explicitly skipped by user; writer323 tests/types/diff passed. Keyboard tab-order of clipped CTA explicitly accepted unresolved ONLY for banner; do not assume accepted for footer. Native review review-a09409bffa516c25 remains terminal escalated and unapproved; no automatic reset/replay/recovery. Its R3-001 incomplete-file allegation was contradicted by exact frozen source; this is not native approval.

## Confirmed footer findings
Relevant paths:
- apps/web/src/components/Footer.tsx: existing natural content and top-edge composition.
- apps/web/src/components/fissure/constants.ts: existing shared path, VIEWBOX_WIDTH1920, FISSURE_EDGE_HEIGHT99.
- apps/web/src/components/fissure/mask.ts: shared masks, legacy reference stretching; contentBottomStrip helper may be obsolete, audit all callers before removal.
- apps/web/src/components/fissure/FissureEdgeDecoration.tsx: shared top/bottom outline/shadow, optional strip positioning.
- apps/web/src/app/(home)/components/banner/FissureBanner.tsx: current banner composition to extract.
- apps/web/src/app/layout.tsx and components/Background.tsx: root stacking/background.

Measured localhost home footer:
| Viewport | Footer height | Canvas x/width | SVG reference |
|1280x900|329px|0/1280px|1920x400|
|820x1180|313px|-230/1280px|1920x400|
|393x852|561px|-443.5/1280px|1920x400|
Mask/outline match same rendered box, so this is deformation, not the banner's former width mismatch. preserveAspectRatio none and mask-size100%100% give horizontal scale.667, vertical.823/.783/1.403. Path bbox~78.7units becomes64.8/61.7/110.5px: squashed desktop/tablet and elongated mobile. Footer top edge must be independent of total content height.
Body relative flex column, footer normalflow sibling. No global opaque foreground content wrapper. Background is separate absolute -z10 patterned layer. Footer canvas left50%/translateX-50%; this is dangerous if placed above viewport-fixed descendants. Existing banner fixed positioning must not gain transform/filter/contain ancestors during layout changes.

## Proposed architecture (names illustrative, use kebab-case for new files)
components/fissure/
- constants.ts: one existing source of path geometry, no copy.
- mask.ts: mask generation, shared edge configuration.
- fissure-surface.tsx: NEW narrow geometric composition: canvas width/origin, top/bottom edge transform, mask, outline/shadow alignment, stable edge strip independent of content height. No responsive sizing policies or fixed/sticky behavior flags.
- FissureEdgeDecoration.tsx: reuse existing renderer, migrate safely; don't gratuitously rename existing paths.
components/banner/fissure-banner.tsx: shared banner adapter extracted from home scope; owns explicit fixed/square responsive sizing, viewport-fixed content and moving clip, banner pointer blocker. Data selection remains home/server Banner.
components/footer/fissure-footer.tsx: footer adapter with top edge, natural content flow and footer-specific reveal policy.
components/Footer.tsx: retains footer content/data/links; composes footer adapter.

One geometric configuration must drive mask, contour, shadow and any matching pointer exclusion: position(top/bottom), canvas origin/width, edge scale/strip. Avoid public independent booleans/numeric SVG dimensions that callers must manually synchronize. No universal banner/footer component with boolean soup. Stable edge height is an explicit design parameter/derived width-based scale, never footer total height/400. Do not choose a new aesthetic amplitude silently; compare reference and confirm if needed.

## Implementation units
- [ ] F1 Extract shared surface and migrate banner without intentional visual/scroll change. Test top/bottom geometry, shared origins and clipping, preserve podcast420/360 and festival640/square; no containing-block regression.
- [ ] F2 Migrate footer to surface and decouple top strip from natural content height. Preserve backgrounds to contour, orientation, shadow and all links. Compare desktop/mobile geometry/pixels. Audit dead content-only helpers after migration, remove only with confirmed no callers.
- [ ] F3 Run bounded DOM-only CSS structural proof for footer reveal BEFORE source implementation. Candidate: natural-height sticky bottom footer below opaque scrolling foreground layer. Must establish real stationary interval and same document flow without duplicated links or guessed spacer heights. This candidate was NOT tested; not established fact.
- [ ] F4 Only after F3 succeeds/real product decision resolved, implement footer adapter/root layering, preserve patterned foreground and banner fixed ancestry. If sticky fails, explicit footer dimensions for fixed approach require user decision; don't silently substitute JS/animation.
- [ ] F5 Independent responsive/route/browser checks, tests/types and handoff.

## Acceptance and verification
Use existing root bun run test --filter=@frijolmagico/web (never direct bun test), fresh cd apps/web && bun run type-check; git diff --check. Existing test infrastructure is Bun isolation/Testing Library, not assume Vitest. Bundled Turbo docs missing but docs rule is BEFORE CHANGING Turbo config/commands, not running unchanged scripts.
Test-first applicable geometry/markup assertions: RED observed before behavior change, GREEN afterwards. Browser-required actual stationary footer coordinates as site moves, reveal starts/ends, forward/reverse scroll, link pointer and keyboard while hidden/visible, no horizontal overflow/white shelves, top/bottom contour pixel alignment and shadow thickness. Include393/430/820 portrait,821 landscape,1280desktop, short pages, nonhome routes, footer taller than viewport, resized font/content and available engines. Preserve no-JS fallback/content reachability. Never inherit accepted banner keyboard issue as footer approval.

## Risks/open decisions
Natural-height CSS sticky footer reveal remains UNPROVEN. Do not present fixed bottom+autoheight reservation as solved: out-of-flow content cannot size its own frame. If explicit footer sizing is necessary ask one focused decision; no source writes before the prerequisite is resolved. Root opaque foreground may hide body pattern or alter fixed banner ancestry; verify all route layouts and stacking without broad redesign. Avoid unrelated cleanup. Split scope into bounded reviewable units; ~400 authored diff lines is a heuristic, ask-on-risk if accumulated delivery grows large. No push/PR/merge without explicit authorization. Work-unit commits only under actual session authorization/policy.

## Next session start
Read this file + Engram topic odd/shared-fissure-footer-reveal/tasks; inspect git state/commits and related task docs. Begin with F1 only after authorized implementation, or F3 read-only proof if necessary to settle architecture. Do not restart native terminal lineage as part of ordinary source work.


## Final commit and handoff evidence
User explicitly authorized commits of completed session work. Source work committed on feat/web-fissure-banner-first:
- 1b5af03c — feat(web): support configurable fissure edge geometry (geometry and regression tests).
- f004a5f6 — feat(web): reveal fixed homepage banner through fissure clip (home order, explicit sizing420/360, CSS fixed content and tests).
- 656747a6 — feat(web): hide informational topbar on homepage (route gate and tests).
Final independent checks:323 tests/0 failures/1151 assertions/73 files; fresh workspace tsc and diff check passed. Additional final browser verification skipped by explicit user request; clipped-CTA keyboard tab-order remains explicitly accepted unresolved. Live festival visual comparison unavailable. Native review remains terminal escalated/unapproved; commits are human-authorized ordinary Git operations, not review approval.
User selected delivery_strategy=single-pr after accumulated review-size warning; no PR/push authorized or performed. Any future feature PR targets dev, never main; version label required per repository policy. Prior untracked festival-lineup-layout.md and festival-schedule-cache.md excluded as unrelated.
Footer architecture is saved in odd/tasks/shared-fissure-footer-reveal.md; NOT implemented. Its natural-height sticky reveal prerequisite remains unproven. Next session should start from the saved plan and reconcile actual Git state. Historical in-progress/blocked notes above are chronology, not a claim that content sizing still exists or tests remain blocked.

Memory mirror update pending: Engram save returned unknown outcome during final synchronization; local committed document is the handoff authority until reconciled.
