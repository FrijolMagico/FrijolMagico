# CSS fixed-content fissure reveal

## Objective
Viewport-stationary banner background/text/CTA clipped progressively by normally scrolling fissure frame. CSS positioning only: no GSAP, animations, transitions, JS scroll compensation or duplicate children. No artificial scroll space.

## Accepted sizing
Remove content mode. Both responsive configs explicit: fixed with height, or square. Podcast landscape420/compact360 fixed (user revised compact640 to360). Festival landscape640 fixed/compact square (legacy840 geometry). Preserve home y0/topbar exclusion/footer and single festival selection.

## Evidence and constraints
- Existing322 tests/types and pixel verification pass before this refactor; preserve blue-to-contour background continuity.
- Chromium153 DOM-only test: fixed single CTA stayed y196 as explicit387px frame moved0/-80/-500; mask clipped at full exit. No full-child or crossbrowser proof yet.
- Transformed canvas ancestors prevent viewport fixation; refactor centering without transforms above fixed layer.
- Mask+clip-path inset0 test visually hid CTA but retained pointer hit; do not adopt that unproven combination.
- Fixed child cannot supply intrinsic height; explicit sizes resolve this. Square remains calculated by width, not840px visible height.
- Existing native review-a09409bffa516c25 terminal escalated must remain untouched; no automatic lifecycle replay/reset. No commits without explicit request, no installs/DB/push/PR.
- Branch feat/web-fissure-banner-first already contains authorized dirty banner changes; preserve unrelated work.
- Forecast200–350 authored changed lines, ask-on-risk delivery, reassess actual scope before expansion.

## Tasks
- [ ] R1 correction implemented; browser verification pending: Remove content API and dead content-only branches as safe, migrate podcast420/640 and festival preserved. Refactor hierarchy to independently sized moving mask/frame and single fixed content layer with no fixed-CB ancestors. Regression tests first. Preserve clipping/hit protection.
- [ ] R2 additional browser verification skipped by explicit user decision: Browser full-child stationary coordinates and actual curve clipping/color; forward/reverse scroll/resize, hidden pointer and keyboard interaction, hero normal flow, footer unchanged; responsive and available browsers. Full prescribed tests/fresh type-check/diff.
- [ ] R3 pending parent: Reconcile checks and limitations; no approval/commit claim. Native stop remains separate human decision.

## Acceptance
- Entire background/text/CTA stationary, not just a link; mask/edge moves with document.
- Frame420/640 podcast at matching layouts; festival640/square preserved.
- No white shelves, new overflow, extra spacer scroll or invisible interactive overlay.
- Hidden responsive variant remains hidden. Keyboard focus must not leave invisible interactive content trapping navigation.
- Source contains no new JS scroll handlers, observers for compensation, animation libraries or CSS keyframe/timeline effects.

## Implementation evidence
- Worker explicit fixed/square API, podcast420/640/festival640square, fixed inner layer and moving mask implemented across6authorizedfiles. RED320pass2fail thenGREEN322pass0fail; fresh tsc and diffcheck pass; estimated200–250authoredlines.
- Worker stopped interaction_required: CSS clipped CTA remains keyboard-focusable. Parent losslessly relayed two choices; user selected accept_partial_css (accept partial CSS implementation with keyboard tab-order unresolved). This narrows acceptance, not accessibility completion.
- No browser claim from writer. Independent verifier mv8fimtp-h-qsfd now checking full content movement/clipping/pointer vs keyboard limitation; source preserved.

## Authorized correction
- User screenshot393/430/820 exposed contour mismatch: mask scales1920path to viewport width, outline/shadow/blocker scale to minimum1280 canvas. Diagnosis source-based; no visual waiver from keyboard choice.
- User authorized fix and revised podcast compact height to360; landscape420/festival640square unchanged.
- Require one width/origin/height mapping across moving clip, decoration/shadow/blocker without transformed ancestors of fixed children. Preserve CSS-only/no animation constraint and accepted keyboard limitation.

## Correction evidence
- Writer aligned mask layer with shared wide canvas geometry used by outline/blocker and fixed content; podcast compact360, landscape420, festival unchanged.
- RED new shared geometry assertion failed then GREEN323tests pass; fresh types/diff pass. Approx30authoredlines excluding prior dirty work.
- No browser acceptance yet; independent verifier mv8k4ixd-j-sqi4 dispatched for screenshot widths393/430/820, scroll stationarity and invisible pointer checks.

## User verification decision
- User: Todo bien, no es necesario la verificación. Cancelled additional browser verifier mv8k4ixd-j-sqi4. No final browser/pixel/stationarity/hidden-pointer acceptance inferred; these checks skipped on explicit request.
- Observed checks remain323tests, fresh types and diffcheck passing from writer.

## Next
Keep implemented fix/podcast420-360 unchanged. Report skipped additional visual verification, accepted keyboard tab-order limitation and unresolved native review. No commits or native approval.


## Final commit and handoff evidence
User explicitly authorized commits of completed session work. Source work committed on feat/web-fissure-banner-first:
- 1b5af03c — feat(web): support configurable fissure edge geometry (geometry and regression tests).
- f004a5f6 — feat(web): reveal fixed homepage banner through fissure clip (home order, explicit sizing420/360, CSS fixed content and tests).
- 656747a6 — feat(web): hide informational topbar on homepage (route gate and tests).
Final independent checks:323 tests/0 failures/1151 assertions/73 files; fresh workspace tsc and diff check passed. Additional final browser verification skipped by explicit user request; clipped-CTA keyboard tab-order remains explicitly accepted unresolved. Live festival visual comparison unavailable. Native review remains terminal escalated/unapproved; commits are human-authorized ordinary Git operations, not review approval.
User selected delivery_strategy=single-pr after accumulated review-size warning; no PR/push authorized or performed. Any future feature PR targets dev, never main; version label required per repository policy. Prior untracked festival-lineup-layout.md and festival-schedule-cache.md excluded as unrelated.
Footer architecture is saved in odd/tasks/shared-fissure-footer-reveal.md; NOT implemented. Its natural-height sticky reveal prerequisite remains unproven. Next session should start from the saved plan and reconcile actual Git state. Historical in-progress/blocked notes above are chronology, not a claim that content sizing still exists or tests remain blocked.

Memory mirror update pending: Engram save returned unknown outcome during final synchronization; local committed document is the handoff authority until reconciled.
