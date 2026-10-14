# Global context bar

## Objective
Render one ContextBar in the root layout above the footer, preserving live route context, home presentation, scroll hiding, and minimal 404 presentation.

## Constraints
- Never add `use client` to any layout or page (including not-found).
- Preserve all pre-existing dirty changes; no commit, push, or PR is authorized.
- Keep existing client boundary in ContextBar; avoid guessing 404 from URL shape.
- Use a server-rendered 404 marker with scoped CSS to hide breadcrumb controls if no simpler reliable built-in route signal exists. No effect-based route registration is necessary.

## Tasks
- [ ] T1 (in progress; implementation verified): Centralize navigation, remove page duplicates, preserve 404 with deterministic tests (observed RED/GREEN). Formal closure remains blocked by the workspace failure and pending review scope.
- [ ] T2 (pending closure; checks executed): Scoped tests, types, server boundaries, and browser layering checked; resolve the pre-existing footer test and isolate review candidate only with separately authorized scope.

## Acceptance and checks
Exactly one global bar outside SiteForeground; home and dynamic route context retained; 404 breadcrumbs absent without guessing route validity; no layout/page client directive; focused regression tests and workspace tests/type-check via root Turbo commands.

## Evidence
T1 implemented; focused new regressions pass. Writer observed RED 334 pass / 12 fail and GREEN 345 pass / 1 fail. Independent verifier reproduced 345 pass / 1 fail and passing type-check (cached). Remaining FissureFooter frame assertion was reproduced before implementation by writer and is outside scope; verifier did not independently verify historical causality. No fully passing workspace suite claimed.
Browser on existing localhost:3000 verified one minimal home bar, dynamic route breadcrumbs, client valid -> missing dynamic route 404 -> valid restoration, horizontal centering and foreground/footer/bar layers 10/20/99. Own browser closed. No HTTP status assertion for dynamic 404. Ignored Playwright logs remain. Parent spot check: localhost HTTP 200 and scoped git diff --check passed. Build/lint not run.
Native ASSESS is unassessable due to intended-untracked declaration; independent verifier required. INSPECT requests untracked selection and currently includes unrelated dirty work, so no native review transaction started.
Existing branch: feat/web-fissure-banner-first. Working tree contains unrelated modifications, including layout, home, and ContextBar. `gentle-ai review mode status` unavailable: executable not found.
Commits intentionally pending explicit authorization.

## Next step
Report implemented and functionally verified migration with one outstanding pre-existing footer test. No source fixes outside scope, no commits, no native approval claimed. Separately authorize footer-test correction and candidate isolation if full closure is desired.
