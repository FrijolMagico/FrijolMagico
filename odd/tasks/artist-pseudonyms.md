# Artist pseudonyms

Objective: Support multiple globally unique current pseudonyms per artist, one primary for general views, and contextual selections in catalog, exhibition and each activity. Admin editor is a text input plus separate dropdown, composed from unmodified shadcn primitives. Catalog slugs follow the selected pseudonym; old canonical URLs remain aliases. Rare collisions append previous canonical slug plus desired slug without a cap.

Constraints: One catalog entry per artist; one exhibition per artist per edition; multiple activities per artist can use different pseudonyms. Rename preserves pseudonym ID and updates uses; old value enters history only when requested. Retiring a referenced pseudonym requires a same-artist replacement. No web UI redesign. Preserve unrelated `odd/tasks/participation-status-visibility.md`. User chose chained PRs to dev and authorized local work-unit commits only; no push or PR.

Verification mode: TDD not established; ordinary checks. Runner: `bun run test` via Turbo; scoped commands as applicable. RDD off. Review budgets: T1 (520), T2 (785), T3a (1,022) exceed ~400 lines; consider size exceptions rather than reducing tests.

- [x] T1 Database model/migration, primary/context IDs and backfill. DB tests/type-check passed; independent finding fixed. Commit `02a4eeaa`.
- [x] T2 Admin mutation contracts, optional history, primary/retirement/reassignment; integration fixtures/projections. Admin 604 tests/type-check and DB 65 tests passed; independent finding fixed. Commit `7b5cea9f`.
- [x] T3a Admin create/edit pseudonym editor with shadcn primitives, primary, per-ID drafts/history and atomic save. Admin 611 tests/type-check passed; independent findings fixed. Commit `f0ba275a`.
- [x] T3b1 Catalog selector and server-side ownership validation. Admin 612 tests/type-check passed; independent review no findings. Commit `6c1ab0f4`.
- [x] T3b2 Exhibition/activity selectors, context IDs, artist-keyed exhibition uniqueness. Admin 616 tests/type-check passed; independent review no findings. Commit `1c0c5936`.
- [x] T4a Admin general/contextual displays, including deleted catalog entries. Admin 623 tests/type-check passed; independent finding fixed. Commit `13a5b810`.
- [x] T4b Public data queries: primary for general views, selected IDs for catalog/exhibitions/activities; no UI redesign. Web 194 tests/type-check passed; independent review confirmed name behavior. Commit `ef3ead37`.
- [x] T5a Alias table and slug allocator on catalog selection, selected pseudonym rename/reassignment; `artist.slug` remains canonical. DB 66/admin 628 tests and type-checks passed; independent review no defects. Commit `72bf8f14`.
- [x] T5b Canonical-first public slug resolution; permanent direct redirects for aliases, metadata/static params canonical. Web 199 tests/type-check passed; independent review no blocker. Commit `5fe11400`.
- [ ] T6 Full verification/build and browser integration review. Root tests passed, type-check passed from cache, lint passed with six warnings. Admin build failed during `/dashboard` prerender because local DB at `127.0.0.1:8080` refused connections; browser smoke not run for that reason.
- [x] T7a Fix participation dialog selected-value labels so exhibit/activity selectors show pseudonym names, not IDs; test create/update dialogs. Checks: admin 632 tests and type-check passed; independent review no findings. Commit `ec44beb4`.
- [x] T7b Fix artist editor checkbox behavior: persisted primary stays checked/disabled while a secondary is pending; pending secondary is checked but enabled and can be unchecked; unchecking restores persisted primary. Disabled checkbox labels use reduced opacity. History remains limited to normalized text changes and clears on revert. Admin 637 tests/type-check passed; independent review no findings. Commit pending.

Current: T1–T5b and T7a `ec44beb4` are committed locally on `feat/artist-pseudonyms`; no push/PR. T7b corrected, independently verified, and pending commit. The user asked to accumulate subsequent findings until explicitly proceeding; `odd/tasks/participation-status-visibility.md` remains untouched.

Accumulated but not authorized for implementation: artist-create editor should start with one required principal; disable “Añadir pseudónimo” until the current/only pseudonym has text, then allow more and selecting the principal. T6 remains open for build/browser verification when local DB is available.