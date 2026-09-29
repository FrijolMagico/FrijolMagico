# Activity card production layout

Objective: restore the `origin/main` activity card disclosure layout while displaying an occurrence's time, making same-day blocks separate cards, and preserving occurrence-specific registration links.

Scope: web festival activity list/card, related unit tests; include the user's concurrent `packages/database/seed/seed.sql` edits in session review, with their domain meaning confirmed by the user and without changing the user's edits. Preserve other untracked files and music presentation.

Acceptance: one card per occurrence (including separate same-day blocks); its time replaces registration-period text; top-corner CTA uses that occurrence's URL and existing eligibility; disclosure retains description, location moves beneath the time with subdued opacity and no pin icon, loses the word “Detalles”, and arrow returns to title area; card surface toggles details while embedded artist/registration links work independently and keyboard access remains intact.

Configuration: TDD unknown for ODD (OpenSpec strict_tdd is SDD-specific, not an ODD selection). Tests: `bun run test --filter=@frijolmagico/web`; type-check: `bun run type-check` (if feasible). Work-unit strategy: exception-ok, explicitly approved by user for 436 authored changed lines (before task doc). RDD switch: off per session.

- [x] T1 (delegated writer): Adjust occurrence-level grouping and card disclosure/links; add focused regression tests. Route: delegated, multi-file write. Check: scoped web tests and type-check; parent readback and risk assessment. Commit: `5afa7f3d` (`feat(web): restore per-block activity cards`).
- [x] T2 (verification): Independently checked behavior and the user's seven seed discipline changes; user confirmed these are intentional and must stay as-is. Full validation: `bun run test` 659 passed, `bun run type-check` 3 tasks passed, `bun run lint` 3 tasks passed with 6 pre-existing warnings, `git diff --check` passed. Browser visual hit-testing not run. Seed work-unit commit: `1508028d` (`chore(database): adjust seeded exhibition disciplines`).

Progress: branch `feat/activity-card-production-layout` from dev. User confirmed seed changes intentional, approved size:exception and requested a single PR to dev without an issue. Repository template explicitly allows missing issue; project policy takes precedence over generic skill. Work-unit commits `5afa7f3d` and `1508028d` created. PR pending; unrelated untracked files excluded.
