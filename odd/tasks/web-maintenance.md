# Web maintenance mode

Branch: `maintenance/web`; worktree: `/home/strocs/dev/FrijolMagico-maintenance`.
Delivery: ask-on-risk; forecast approximately 180 authored lines. Do not publish or touch database/admin.

- [x] 1. Replace web root with a DB-independent maintenance view using existing logo, static top-bar info, existing background and footer styling; remove navigation, fissure, featured artists. Keep project social links only in footer (not below message), remove site navigation links. Route: delegated writer (multiple non-trivial files). Evidence: web tests (247 passing) and type-check before final social-link removal; final edit user-verified, automated recheck skipped by explicit request. Commit `5f3af750`.
- [x] 2. Redirect all application subroutes (including API) to `/` via Next proxy without DB imports; retain framework and explicit static assets needed for the page. Route: delegated writer (proxy + tests). Evidence: proxy tests previously passed; final candidate verification skipped at user request. Commit `f0dbcb7e`.

- [x] 3. Exclude unreachable DB-backed section route entrypoints from maintenance build (retain source modules). Route: delegated exploration, mechanical removal after writer could not delete, independent verification. Evidence: local web build passed and focused proxy suite passed (26 tests); build emitted a nonfatal localhost fetch failure, so absence of all data access remains unproven. Commit pending.

Checks: original 247 web tests and type-check passed before final social-link removal. Maintenance route removal build and focused proxy tests passed; full suite interrupted by Bun crash in an earlier run. User authorized production deployment; Vercel first build failed on blocked DB before route removal. No PR authorized.
