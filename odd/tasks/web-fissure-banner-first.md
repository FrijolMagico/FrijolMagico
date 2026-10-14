# Web fissure banner first

## Objective
Render homepage sections as FissureBanner, HeroSection, FeaturedArtists. Keep the banner top flat and only its bottom fissure, reusing the existing shared decoration without wrapper rotation.

## Scope and constraints
- Homepage composition, banner-specific layers, shared mask options and focused tests.
- Preserve default top mask and footer behavior; no shared decoration duplication.
- No remote/database operations, installs, push or PR. Commits require explicit user request.
- Branch: feat/web-fissure-banner-first; base: d9c6e0956e64e439e9a6deb67f217a3f183c7fbf.
- Existing unrelated untracked task documents must remain untouched.
- Delivery strategy: ask-on-risk; forecast 100–220 authored changed lines.

## Tasks
- [ ] T1 (implemented; verification pending, delegated worker): Add bottom-only mask support and regression coverage preserving default/top and both-edge behavior. Reuse the existing decoration, remove banner upper decoration/shadow/blocker. Multi-file writer trigger applies.
- [ ] T2 (implemented; verification pending, delegated worker): Reorder homepage banner/hero/featured artists; preserve unrelated layout and spacing unless demonstrably necessary. Same bounded writer, sequential work.
- [ ] T3 (in_progress, delegated verification): Run applicable checks and inspect responsive layout/footer. Record skipped or blocked checks explicitly. Command verification trigger applies.

- [ ] T4 (functionally verified; commit pending, delegated worker): Hide TopBarInfo only on exact homepage / via a small client pathname gate surrounding existing server wrapper. Preserve festival/fallback branches, shared body spacing and navigation header; add focused route-gate regression tests. Multi-file writer trigger applies.

## Acceptance criteria
- Banner appears before hero and featured artists.
- Banner upper edge has no fissure, shadow, clipping or click interception.
- Bottom fissure and shadow remain functional at both responsive variants.
- Footer top fissure and default mask semantics are unchanged.
- TopBarInfo hidden on / and retained on non-home routes and client navigation.

## Verification evidence
- Baseline root type-check passed, including web (3 successful Turbo tasks).
- Baseline tests skipped: installed Turbo 2.10.8 lacks required bundled docs/README.md and invocation docs. Never use bun test.
- No direct fissure coverage found; test-first is preferred if prescribed runner is runnable. Otherwise record runner limitation without inventing RED/GREEN.
- gentle-ai review mode status unavailable: executable not on PATH; review availability must be assessed through facade before closure.
- T1: bottom-only top=false option added with y=0 rectangle; banner upper decoration/blocker removed; 3 regression scenarios authored. Shared decoration/footer unchanged.
- T1 worker: git diff --check passed; cd apps/web && bun run type-check passed. Tests unexecuted, no observed RED/GREEN.
- Worker also inadvertently ran root type-check successfully; no reported mutation. Subsequent checks must use explicit workspace cwd.
- Native ASSESS: unassessable because untracked scope needs declaration; RDD on, unknown native outcome; independent verification required.
- T2: homepage reordered banner -> hero -> featured artists; initial workspace type-check and git diff --check passed. User subsequently required zero top gap: removed main pt-24, changed md:py-12 to md:pb-12 preserving bottom spacing, and removed wrapper pt-6. Initial padding removal passed types but banner remained y48. Root body pt-12 confirmed cause. User explicitly chose banner y0 behind fixed topbar; added homepage main -mt-12 compensating shared padding without changing other routes. Fresh desktop/mobile verification dispatched mv5jamx1-c-hcsv.
- Native review consent accepted; lineage review-a09409bffa516c25 created (medium, 141 changed lines, review-reliability). Capture failed with native-operation-failed; bound STATUS escalated with native_stop_required, cause unknown_causality, finding R3-001. No approval/acknowledgement. Terminal stop; preserve authority, no retry/reset/recovery without authorized continuation.
- Independent verifier: workspace type-check and git diff --check passed. Browser checks at 1280x900 and 390x844 passed: section order, flat banner top, bottom fissure/shadow, upper/bottom hit tests and unchanged footer top fissure. Three external avatar image 404s observed; no warnings. Tests still skipped due missing Turbo docs; no RED/GREEN claimed. Pre-existing server preserved; opened browser sessions closed; only ignored .playwright-cli artifacts generated.
- R3-001 incomplete-file claim contradicted by exact frozen tree (71 lines, closure and return present, identical to live file); native authority remains stopped.
- Home -mt-12 compensation verified banner y0 at desktop/mobile, no horizontal overflow.
- T4 worker added route gate around server wrapper, six route/null/navigation regression tests. Reports RED6 then GREEN6 and full prescribed Turbo test run309 passed0 failed, workspace types/diff check passed. Independent verifier confirmed prescribed Turbo run:309 tests,0 failures,1085 assertions across69 files including6 gate and3 mask tests. Workspace types and diff check passed. Browser verified home bar absent/banner y0, catalog/festival bar present desktop/mobile and SPA catalog->home->festivals toggling. Avatar404s observed. Required bundled Turbo docs remain missing; worker/verifier nonetheless executed command, an instruction-compliance exception, not a resolved prerequisite. Historical RED not independently verified. Existing wrapper null-case test mislabeled (expects non-null), follow-up only; no scope expansion.

## Progress and next step
T1 implemented and browser-verified; deterministic tests still unexecuted. T2 order independently browser-verified. T3 checks returned; remaining blockers are test-runner prerequisite and native terminal escalation. Read-only diagnosis active; no lifecycle replay or code correction authorized by this investigation. Work-unit commits pending explicit user authorization; no task closure commit claimed.


## Final commit and handoff evidence
User explicitly authorized commits of completed session work. Source work committed on feat/web-fissure-banner-first:
- 1b5af03c — feat(web): support configurable fissure edge geometry (geometry and regression tests).
- f004a5f6 — feat(web): reveal fixed homepage banner through fissure clip (home order, explicit sizing420/360, CSS fixed content and tests).
- 656747a6 — feat(web): hide informational topbar on homepage (route gate and tests).
Final independent checks:323 tests/0 failures/1151 assertions/73 files; fresh workspace tsc and diff check passed. Additional final browser verification skipped by explicit user request; clipped-CTA keyboard tab-order remains explicitly accepted unresolved. Live festival visual comparison unavailable. Native review remains terminal escalated/unapproved; commits are human-authorized ordinary Git operations, not review approval.
User selected delivery_strategy=single-pr after accumulated review-size warning; no PR/push authorized or performed. Any future feature PR targets dev, never main; version label required per repository policy. Prior untracked festival-lineup-layout.md and festival-schedule-cache.md excluded as unrelated.
Footer architecture is saved in odd/tasks/shared-fissure-footer-reveal.md; NOT implemented. Its natural-height sticky reveal prerequisite remains unproven. Next session should start from the saved plan and reconcile actual Git state. Historical in-progress/blocked notes above are chronology, not a claim that content sizing still exists or tests remain blocked.
