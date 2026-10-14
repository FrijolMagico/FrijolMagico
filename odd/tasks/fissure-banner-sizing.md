# Fissure banner sizing

## Objective
Introduce landscape/compact sizing objects with content as the independent default for both variants. Support explicit fixed height and square sizing. Podcast uses content in both; active festival preserves its current landscape640 and square compact appearance with840 internal geometry reference.

## Constraints
- Preserve bottom-only edge shape, shadow scale, click blocker alignment, responsive820px/portrait selection, footer top edge, homepage y0 and topbar exclusion.
- Separate layout sizing from SVG coordinate reference. Prefer CSS/in-flow content; ResizeObserver only when evidence shows necessary. No direct useEffect.
- Resolve festival selection once for matching content/sizing, preserve cache/data access semantics.
- Existing dirty work on feat/web-fissure-banner-first is authorized prior work; preserve unrelated festival task documents.
- No installs, DB changes, publishing or commits without explicit request. Existing native lineage review-a09409bffa516c25 is terminal escalated; never replay/reset it.
- Delivery: ask-on-risk, preliminary forecast250–390 authored diff lines for this scope; reassess after baseline. No arbitrary size-driven compression.

## Tasks
- [ ] S1 baseline verified; no source edits; commit not applicable — delegated verifier: Capture current visual and structural baseline for podcast/festival geometry, clipping, shadow and pointer zones. Confirm runnable prescribed checks and evidence before source edits.
- [ ] S2 child-fill correction functionally verified; commit pending explicit request — delegated worker: Test-first implement typed sizing API, natural-flow content and coordinated geometry, then migrate all consumers. Preserve explicit legacy festival visuals. Add tests for defaults, each mode, selection and dynamic content as applicable.
- [ ] S3 screenshot/pixel checks passed; live festival comparison unavailable — delegated verifier: Run focused/full prescribed workspace tests, type-check, diff checks and responsive comparison. Check820/821 landscape/portrait, narrow mobile, dynamic children, footer and click regions. Record failures/skips; no false visual closure.

## Acceptance
- Omitted landscape/compact independently use content; height only allowed for fixed.
- Podcast height follows children on desktop/mobile without clipping/circular h-full dependency.
- Festival visuals match baseline, including compact edge scaling.
- No duplicate active-festival fetch decision, no hydration/layout feedback loop or new horizontal overflow.

## Evidence / open technical questions
- Read-only scout mapped current absolute mask/content, min-w-7xl canvas, numeric viewBox and h-full children. Merely using measured height for square SVG would change visual scale; preserve baseline.
- S1 confirmed309 tests pass and scoped type-check pass. Correction: AGENTS requires bundled Turbo docs before CHANGING configuration or commands; running existing prescribed scripts unchanged is allowed. Earlier blanket test-runner blocker/compliance warnings were incorrect. No command/config changes needed.
- S1 live branch podcast: desktop1280x900 banner1280x640/y0, viewBox1920x640 bottom541; mobile390x844 banner390square, inner1280x390/x-445, viewBox1920x840 bottom741. Compact820/821 portrait and landscape821 switch verified. Edge reference99, blur6/stroke16/outline2. No horizontal overflow. Active festival not live: must cover via deterministic branch fixtures, no DB/config changes.
- Prior viewport checks home y0 desktop/mobile; topbar hidden only at /; unrelated external avatar404s.
- Existing review stop R3-001 incomplete-file allegation contradicted by exact frozen71-line source; not approved and untouched.

## S2 evidence
- API content/square/fixed implemented; independent content defaults. Server Banner fetches once and wraps podcast content or festival640fixed/square. Podcast h-full removed; content padding added. Homepage hardcoded wrapper removed. Shared footer untouched.
- Worker RED prescribed full tests310 pass5 fail; GREEN315 pass0 fail;6 tests added. Scoped types and git diff --check pass. No observer/direct useEffect.
- Content geometry retains640/840 references scaled with natural height; exact visual thickness, alignment and CTA clearance still need S3.
- S2 authored diff cannot be cleanly separated from earlier dirty source; no work-unit commit performed (explicit request required).

## S3 evidence / correction
-315 tests passed71files; scoped type-check Turbo cache hit (fresh tsc not observed); diff check passed.
- Podcast desktop1280x288 y0, mobile390x236, responsive selection correct, CTA initial hit succeeds, no horizontal overflow. Browser-only text expansion236->1406 shows natural growth.
- Confirmed regression: fullheight SVG with640/840 references scales edge99 and blur with content height (45%desktop/28%mobile), violating visual scale invariant. Dynamic text changes edge size too. Matching mask/blocker refs alone insufficient.
- Festival live visuals unavailable, mock tests only. Footer position naturally shifts with shorter banner; style/geometry comparison needed, not absolute page y equality.
- S2 reopened. Scout recommends bottom-anchored stable strip for content only. Parent spot-check confirmed VIEWBOX_WIDTH=1920 (scout width640 inference incorrect). Correct baseline vertical scales: landscape1 => edge99px; compact viewportWidth/840 => edge99*viewportWidth/840, independent of content height. Horizontal canvas mapping remains min-w7xl/1920. Correct all mask/decoration/blocker strip coordinates together; preserve fixed/square/footer defaults.
- Correction scope expands narrowly to optional shared decoration positioning and mask helper plus focused tests; no footer source or constants/path edits.

## Correction implementation evidence
- Content-only bottom-anchored99-unit strip implemented:99px landscape, calc100vw*99/840compact. Common scale for composite mask, shared optional decoration positioning, inverse click blocker and content clearance. Legacy fixed/square/footer paths unchanged.
- Writer observed RED316pass4fail; GREEN320tests/72files pass0fail. Fresh workspace tsc and diff check passed. Six authorized surfaces touched; no observer or new source hooks.

## Final independent verification
-320 tests passed72files; fresh workspace tsc --noEmit passed; git diff --check passed.
- Browser1280x900,390x844,820/821portrait,821x390landscape: banner y0; no horizontal overflow; narrow screenshot no seam/rectangular mask/clipping. CTA hit succeeds; below-curve blocker works.
- Strip99desktop,45.95at390,96.64at820,96.76at821portrait,99at821landscape; mask/decor/blocker bottom-aligned.
- DOM-only growth387->1087 retained99px edge and CTA hits, no overflow. Reload restored contents.
- Footer viewBox1920x400 top rotated path/default mask intact; height329.33 unchanged under dynamic expansion.
- Live festival comparison unavailable (inactive); passing tests cover640fixed/square840 references. No DB/config mutation to force it.

## User screenshot correction
- User screenshot shows blue child background ends at straight line above white fissure strip; previous visual acceptance missed this defect.
- User explicitly requires children fill entire banner area, with child background/content clipped by fissure. No hardcoded podcast background on generic parent.
- Scout confirmed generic masked-wrapper bottom padding sits outside background-bearing child section; natural child ends before reserved strip. Not mask path failure or missing podcast h-full.
- Writer removed generic wrapper outer strip padding; PodcastBanner consumes inherited edge CSS variable inside its own bottom padding/background. No hardcoded parent color/cloning. RED319pass3fail then GREEN322pass0fail; fresh types/diff pass.
- Independent verifier confirmed screenshot/color continuity at1280desktop,390mobile,820portrait,821landscape. Pixel samples blue above curve and rgb228 below; no white shelf. Parent spot-read /tmp/fissure-mobile-390x844.png confirms blue reaches curved outline.
- Child/mask bounds match, stable strip99landscape/45.96at390/96.64at820, no overflow. Actual CTA clicks before/after DOM growth387->1807 succeeded, reload restored387/122-character text; footer329.33 unchanged.
-322tests pass, fresh tsc passes, diff check passes. Screenshots /tmp/fissure-desktop-1280x900.png, /tmp/fissure-mobile-390x844.png, /tmp/fissure-820x900.png, /tmp/fissure-821x390.png, /tmp/fissure-expanded-full.png. Live festival still unavailable.

## Next
Child fill/background continuity corrected and independently screenshot/pixel verified. Applicable functional checks complete; no further source fix indicated. Live festival screenshot comparison remains unavailable. No commits without explicit user request; checkboxes remain open for that closure requirement. Old native review remains terminal escalated, no reset/replay or approval claimed. Human review/authority disposition remains pending independently of functional results.


## Final commit and handoff evidence
User explicitly authorized commits of completed session work. Source work committed on feat/web-fissure-banner-first:
- 1b5af03c — feat(web): support configurable fissure edge geometry (geometry and regression tests).
- f004a5f6 — feat(web): reveal fixed homepage banner through fissure clip (home order, explicit sizing420/360, CSS fixed content and tests).
- 656747a6 — feat(web): hide informational topbar on homepage (route gate and tests).
Final independent checks:323 tests/0 failures/1151 assertions/73 files; fresh workspace tsc and diff check passed. Additional final browser verification skipped by explicit user request; clipped-CTA keyboard tab-order remains explicitly accepted unresolved. Live festival visual comparison unavailable. Native review remains terminal escalated/unapproved; commits are human-authorized ordinary Git operations, not review approval.
User selected delivery_strategy=single-pr after accumulated review-size warning; no PR/push authorized or performed. Any future feature PR targets dev, never main; version label required per repository policy. Prior untracked festival-lineup-layout.md and festival-schedule-cache.md excluded as unrelated.
Footer architecture is saved in odd/tasks/shared-fissure-footer-reveal.md; NOT implemented. Its natural-height sticky reveal prerequisite remains unproven. Next session should start from the saved plan and reconcile actual Git state. Historical in-progress/blocked notes above are chronology, not a claim that content sizing still exists or tests remain blocked.

Memory mirror update pending: Engram save returned unknown outcome during final synchronization; local committed document is the handoff authority until reconciled.
