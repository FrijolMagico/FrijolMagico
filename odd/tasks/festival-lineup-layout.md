# Festival lineup layout

## Objective
Uniform text-lg/font-bold uppercase no-wrap participant names, decorative circles, centered rows below 768px and left-aligned from md; poster sticky bounded before activities; top bar z-index adjustment authorized by user.

## Tasks
- [x] T1 Implement typography, separators and sticky boundary with regression tests.
- [x] T2 Independently verify original layout in browser.
- [x] T4 Center mobile participant rows with RED/GREEN regression.
- [x] T3 Commit, push and open PR to dev.

## Evidence
300 web tests passed after mobile centering; 1065 assertions. Earlier independent lint/type-check/diff check passed. Browser XV/XVI at 375/768/1280px confirmed typography, circles, mobile poster fit and sticky above activities. 10px page overflow at 768px outside article remains. Additional browser centering verification cancelled and native review skipped at explicit user request. Top bar not separately verified. No issue lookup performed.

## Commits and delivery
- b3a18baf — fix(festivals): unify lineup styling and contain sticky poster
- 126bfb78 — fix(web): keep top bar above page content
- Branch: fix/festival-lineup-layout
- PR: https://github.com/FrijolMagico/FrijolMagico/pull/246
- Base: dev; label: patch.
- Push and PR creation explicitly authorized and confirmed. No merge performed. Tracking document remains local/uncommitted.

## Next step
Human review and CI; no further verification requested.
