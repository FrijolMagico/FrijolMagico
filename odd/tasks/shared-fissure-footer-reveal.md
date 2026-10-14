# Shared fissure composition and footer reveal — implementation handoff

## Status and authorization
Implementation resumed and completed following explicit user continuation. Automated verification passed; manual visual review belongs to the user. Changes are unstaged/uncommitted; no new commit or publishing authorization inferred from the earlier request to commit already-completed work.

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
- [x] F1 Extract shared surface and migrate banner without intentional visual/scroll change. Test top/bottom geometry, shared origins and clipping, preserve podcast420/360 and festival640/square; no containing-block regression.
- [x] F2 Migrate footer to surface and decouple top strip from natural content height. Preserve backgrounds to contour, orientation, shadow and all links. Compare desktop/mobile geometry/pixels. Audit dead content-only helpers after migration, remove only with confirmed no callers.
- [x] F3 Run bounded DOM-only CSS structural proof for footer reveal BEFORE source implementation. Candidate: natural-height sticky bottom footer below opaque scrolling foreground layer. Must establish real stationary interval and same document flow without duplicated links or guessed spacer heights. Candidate subsequently proved in a bounded browser-only experiment; see resumed implementation evidence. No final production browser checks were performed per user instruction.
- [x] F4 Only after F3 succeeds/real product decision resolved, implement footer adapter/root layering, preserve patterned foreground and banner fixed ancestry. If sticky fails, explicit footer dimensions for fixed approach require user decision; don't silently substitute JS/animation.
- [x] F5 Independent automated lint, types, build and regression checks. Browser/visual checks intentionally skipped at user request; manual inspection pending.

## Acceptance and verification
Use existing root bun run test --filter=@frijolmagico/web (never direct bun test), fresh cd apps/web && bun run type-check; git diff --check. Existing test infrastructure is Bun isolation/Testing Library, not assume Vitest. Bundled Turbo docs missing but docs rule is BEFORE CHANGING Turbo config/commands, not running unchanged scripts.
Test-first applicable geometry/markup assertions: RED observed before behavior change, GREEN afterwards. Browser-required actual stationary footer coordinates as site moves, reveal starts/ends, forward/reverse scroll, link pointer and keyboard while hidden/visible, no horizontal overflow/white shelves, top/bottom contour pixel alignment and shadow thickness. Include393/430/820 portrait,821 landscape,1280desktop, short pages, nonhome routes, footer taller than viewport, resized font/content and available engines. Preserve no-JS fallback/content reachability. Never inherit accepted banner keyboard issue as footer approval.

## Risks/open decisions
Historical prerequisite resolved by F3: natural-height CSS sticky reveal mechanics were demonstrated; production visual validation remains manual. Do not present fixed bottom+autoheight reservation as solved: out-of-flow content cannot size its own frame. If explicit footer sizing is necessary ask one focused decision; no source writes before the prerequisite is resolved. Root opaque foreground may hide body pattern or alter fixed banner ancestry; verify all route layouts and stacking without broad redesign. Avoid unrelated cleanup. Split scope into bounded reviewable units; ~400 authored diff lines is a heuristic, ask-on-risk if accumulated delivery grows large. No push/PR/merge without explicit authorization. Work-unit commits only under actual session authorization/policy.

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


## Resumed implementation
User requested continuation and explicitly declined a keyboard-focus fallback after explanation: Tab may focus links behind the opaque foreground. Preserve focusability; no focus-within position/z-index changes or JS. This acceptance is footer-specific.
F3 completed browser-only proof: sticky bottom0 single natural-height footer below opaque foreground stationary across desktop1280x900/mobile393x852/tablet820x1180, reverse scrolling; short page flow and tall footer scroll reachability tested. Bare sticky occlusion is accepted, not fixed. Real background/palette fidelity and route integration still pending.
Implementation authorized; no new push/PR/merge authorization. Existing single-pr delivery preference retained. Source files unchanged at resumption. Prior unrelated untracked festival taskdocs excluded.
Routes: F1 delegated writer (multi-file preparation/write trigger), F2 delegated writer, F3 delegated verifier browser proof complete, F4 delegated writer, F5 delegated verifier for browser and risk-gated independent checks. One writer at a time.
Current: F1 implemented, verification pending: shared fissure-surface.tsx and one new test; banner delegates mask/contour composition while retaining sizing, viewport-fixed placement and pointer blocker. Observed RED missing module, GREEN324tests/1160assertions, typecheck/diff passed. Required lint/build verification delegated next; no browser checks. F2/F4 pending. No source work-unit commit yet for resumed scope.

Verification policy override: user explicitly requested NO further visual/browser verification. User will inspect manually and supply feedback. Required final automated checks: lint, typecheck and build. Preserve deterministic regression checks; do not launch F5 browser sessions. Earlier structural proof is historical evidence, not final visual approval. Report any build/environment blockers without bypassing checks or accessing secrets.

F1 independent verification: root scoped build PASS (compile/staticgen/sitemap; metadataBase warning), workspace typecheck PASS, diff check PASS. Lint FAIL: eight react/no-children-prop errors in previously committed FissureBanner.test.tsx. Bounded delegated correction of test JSX syntax only underway; no lint suppression. F1 stays in progress until lint passes. No browser checks performed. Source unit not committed pending completion and current user authorization policy.

F1 deterministic/structural verification complete: lint correction changed only8 test children-prop expressions; lintPASS,324testsPASS, fresh typesPASS, diffPASS. Prior independent buildPASS. ASSESS unassessable (untracked scope declaration), unknown native outcome -> independent verifier required, independent lint/types/build already performed with writer correction after lint failure; final verifier will cover integrated diff. F1 implementation verified, no new commit: earlier explicit commit request covered work completed then, no fresh commit authorization inferred. F2 now in progress. Native prior terminal authority not reset/recovered.

F2 implemented and self-verified: Footer content migrated once into primary-palette FissureFooter adapter and natural-height shared surface; top mask/contour strip derived max(100vw,80rem)*99/1920 independent of total content height.328tests/1179assertionsPASS,lintPASS,typesPASS,diffPASS. F4 now in progress. Final integrated build and independent review pending; visual evaluation delegated to user. No new commits authorized/performed.

F4 implemented: SiteForeground opaque flexing patterned foreground wraps route content/chrome and skip target; single natural-height sticky bottom0 footer sibling z0. No transform/scroll wrapper/JS/focus fallback. Worker RED missing foreground module then GREEN329tests,lintPASS,typesPASS,buildPASS(existing metadataBase warning),diffPASS. F5 independent automated final verification pending; user performs all visual checks. Native inspect requested explicit intended-untracked declaration for six new relevant source/test files; unrelated festival docs excluded. No new commits or publication.

## Final automated verification
Independent verifier: lintPASS(Turbo cache), fresh workspace typesPASS, buildPASS(Turbo cache of actual successful integrated build),329tests/1188assertionsPASS(forced execution),diffPASS. No severe structural findings. Existing metadataBase warning defaults social image URLs to localhost; pre-existing follow-up, not introduced here. No generated/version changes; six relevant new files remain untracked and were directly inspected/tested. Unrelated festival taskdocs untouched.
Native review consent declined for exact candidate (644changedlines/16files); no lineage created or approval. ASSESS unassessable due untracked declaration, conservative independent verifier completed. Earlier terminal lineage untouched. No new commits/push/PR.
Next: user manually inspects desktop/mobile geometry, background continuity, page routes and scroll reveal, then supplies feedback. No visual approval claimed. Source implementation and automated checks complete; commit closure pending explicit authorization.

## Correction C1 — moving fissure, stationary content
User rejected F4 whole sticky footer covered by rectangular opaque foreground. Desired behavior matches banner: content viewport-fixed at bottom; actual masked surface and top contour move in document flow. Prior automated checks were not behavior approval.
User explicitly accepted responsive explicit footer frame heights after explanation fixed child cannot reserve natural parent height. Initial contract400pxlandscape/640pxcompact based on prior measured329/561pxcontent; centralized constants, adjustable after manual feedback. No duplicate footer content or links, no JS measurement/scroll compensation, no animation, no focus fallback. Explicit heights supersede original naturalheight preference for this adapter only; shared natural-height geometry API need not be removed.
C1 delegated writer (multi-file trigger) in progress. Scope footer adapter/shared surface/mask/decoration and narrow root layering corrections if needed. Tests must assert moving frame NONsticky and stationary inner content; lint/types/build required. No browser/visual checks. No new commits authorized.

C1 implemented: normalflow NONsticky responsive400/640 frame, single viewport-fixed bottom0 content; moving topstrip mask and contour align in shared surface. Footer stacking now above foreground for actual fissure clipping instead of rectangular-cover reveal. Writer observedRED1 against prior sticky structure thenGREEN330tests;lint/types/build/diffPASS(metadataBasewarningexisting). No browser/visual checks. Independent verification now pending, no visual approval claimed. Explicit frame height/short viewport overflow remains manual check.

C1 independent final verificationPASS:lint/types/build(cachemiss)/330tests/diff; native review-51b1175dd5955bfc approved and exact acknowledgement completed authorityburned for frozenC1, no Gitcommit. Subsequent user manual feedback C2: anchor footer content bottom and fix medium layoutoverflow. Scout finds fixed content inherits1280mincanvas decorative overscan and contentstack lacks fullheight/justify-end; narrow correction Footer.tsx and adapter viewportcontentwidth; geometry canvas staysoverscanned. C2 delegated writer inprogress; no browser verification. C1 approval does not cover C2.

C2 implemented: actual footerstack h-full flexcol justify-end; fixed content left0 width100% separate overscanned maskcanvas; minwidth constraints and smaller mediumcolumn gap,400/640 unchanged. ObservedRED thenGREEN331tests/1207assertions,lint/types/build/diffPASS(existingmetadataBasewarning). Visual fit/overflow requires user manual feedback. C1 native approval historical only; C2 preflight pending. No new commits.

C2 verification complete:331tests/1207assertions,lint/types/build/diffPASS; existingmetadataBasewarning only. Native review-435039882dc1cc24 approved with exact acknowledgement authorityburned for frozenC2; no Gitcommit/publication. Contentbottomalignment/mediumviewportfit await manualuserfeedback; no browserchecks performed. Newsourcechangesunstaged, prior unrelatedfestivaldocs untouched.

## Banner md follow-up B1
User authorized mobile<768 desktop>=768 independentorientation. Outerselector changed hiddenmd:block/md:hidden;332tests/lint/types/buildPASS but manualfeedbackreports horizontaloverflow. Not behaviorapproved. Read-only diagnosisfound definite festivalpicture media still821landscape vs newmdwrapper; oversizedfixedcontentwidth may contribute scrolloverflow. Scoutincorrectclaims leftoffsetzero and surfaceoutsideheader rejected by parent spotread. B1 boundedwriter now correcting internalmedia and contentviewportwidth while preserving decorativecanvas mask/contour/blockergeometry, heights420/360and640square; nofooterchanges/no rootoverflowhidden/no browser. Finalchecksrequired. Native lastcandidate reviewdeclined no lineage; priorC2approveddoesnotcoverB1. No newcommits.

## Scope correction and separate festival media task
Userclarified overflow originates FOOTER not banner. Speculativebannerfixedwidthandfestivalmedia deltas were removed by writer preserving approvedmd768; emptyActiveFestivalBanner.test.tsx remains for realtestreuse. Scoutfooterreportswidecanvaspotential but repeatsincorrect claimnegativeleftzero; parentdoesnotacceptasprovenruntimecause. Footerwritespaused pendinguserpermission numericDOMonlymeasurement (no visual/screenshots); no runtime evidenceyet.
Userseparatelyauthorized festivalpicture mismatchfix: media768widthonly noorientation; boundedwriter taskmv8o6iuy-16-0sy5 now onlyActiveFestivalBanner+test. Not footerfix; no FissureBannerwidthchanges. Final lint/types/build/testchecksrequired. No commits.

## Footer overflow C3 confirmed source correction
User pinpointed missing local clipping: wide centered footerfissure must crop lateral overscan like banner. Parent spotreadconfirms FissureFooter outerfooter class lacks overflow-hidden; bannerheader has it. Keep sharednegativeleft centeredcanvaswidth unchanged; add clipping at footerframe only, no globalCSS/contentwidth/pathresize. No browser needed/requested. Festivalmedia independentfixcomplete333tests/lint/types/buildPASS existingmetadataBaseandimagequalitywarnings; not footerfix. C3 delegatedwriter underway with regression for localframeclipping and preservedsharedgeometry/fixedcontent. No commits.

C3 implemented: overflow-hidden on outerfooterlocalframe only; centeredoverscannedcanvas/mask/contour and fixedviewportcontent unchanged. ObservedREDmissingclip thenGREEN333tests;lint/types/build/diffPASS. No browser/DOMmeasurementperformed. User manualconfirmation of horizontaloverflowpending; no runtimeclaim. Separatefestivalpicture768widthonlyfix included and tested; speculativebannerwidthchangesremoved. No newcommits. Nativepreflightpending.

## C4 shared amplitude — user-approved correction
User supplied banner/footer screenshots a6f0158d... andb503cefd...; parent read images only (no browser). Difference is verticalamplitude, footerflatter. Prior centeringdiagnosis superseded; no wideningfootercontent. User explicitly approved sharedamplitude independentofcontent/frameheight usingbannerreference. Design singleedgestripamplitude drives mask/contour/shadow and matchingpointerblocker for top/bottom; preserve centeredwidecanvas/localoverflowclip and singlefixedfootercontentviewportwidthbottomaligned,400/640frameheights,podcast420/360festival640square,md768banner/art. C4 delegatedwriter multi-filetrigger, test-first geometrycontracts, lint/types/build final. No browser/visualautomated or commits.

C4 complete: shared99pxamplitude/2pxoverlap masktopbottom/contour/shadow/bannerblocker,335tests/lint/types/build/diffPASS. Uservisualapproval received. C5 nextboundedwriter: singleBackgroundrootbody acrossforeground+footer, foregroundopaque fillobsolete fixedmaskedmodel and removespatternseam; no duplicatepattern or transformancestor. Footerbothframe/content mobile640/md400>=768 widthonly replacesold820portrait. Geometrysurface retainsno breakpointpolicy, adaptersusemd. No browser, no commits.

C5 implemented and corrected: SINGLEBackgroundbodylayer, transparentSiteForeground, patternspansforeground/footer. Initialworkeraccidentallyinvertedheightdefault400md640; parentcaughtreport, boundedcorrectionobservedREDthenGREEN nowBOTHframe/content h-[640px] md:h-[400px],no820portrait.336tests/lint/types/build/diffPASS(existingmetadataBasewarning). Shared99amplitude unchanged anduservisualapproved; backgroundseam/mdheightmanualvalidationpending. Finalnativepreflight/independentchecks pending; no commits.
