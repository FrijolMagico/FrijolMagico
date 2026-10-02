# Staging seed harness cleanup

Goal: Remove scripts and tests created solely for the already completed one-time staging seed import, while retaining synthetic fixture contract tests and recurring migrate/pull safety tests. Work on `refactor/database-staging-web-cache`; do not touch unrelated worktree changes or `packages/database/.env.example`.

Constraints: no remote DB operations, no local snapshot writes, no seed re-import, no push or deploy. Keep the historical provisioning record but distinguish retired commands from current workflow.

- [x] C1 Remove `check:staging-seed` / `load:staging-seed`, their one-off scripts and matching tests; leave `seed/seed.sql`, synthetic-seed-contract tests, recurring migration configs/tests and pull scripts/tests intact. Check: 104 database tests and scoped type-check pass after removal.
- [x] C2 Remove obsolete one-time instructions from the active database README and annotate historical task records. Check: independent scoped database tests 104 passed/0 failed, scoped type-check passed after C1; reference search found removed commands only in historical `odd/tasks/` evidence, `git diff --check` clean. User changes preserved.
