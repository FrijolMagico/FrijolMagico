# Catalog batched DAL

Goal: Reduce Turso rows read without changing catalog output or introducing N+1 queries.

Scope: web catalog read path and required cache invalidation coverage; no production SQL or schema migration without measured evidence. Existing untracked files remain untouched.

- [x] T1 Characterize existing catalog SQL output and establish reproducible local baseline (queries, approximate SQLite work, exact output).
- [ ] T2 Implement set-based catalog base/participation/date reads and composition behind existing repository contract; verify exact output and bounded query count.
- [ ] T3 Audit and correct admin-to-web invalidation for affected catalog dependencies; retain broad tags until freshness tests pass.
- [ ] T4 Measure combined reads and regression checks; switch repository and document rollback/evidence.

Verification: ODD TDD mode disabled by explicit user choice; functional tests via `bun run test --filter=@frijolmagico/web`. Local SQLite databases exist but are ignored, non-portable fixtures; tests must not depend on their presence. T1 route: delegated writer (multi-file preparation/write trigger). Delivery strategy: ask-on-risk; forecast >400 authored changed lines across all four tasks. User chose one feature branch and to decide PR slicing later. User authorized T1 local commit only.

T1 status: implementation and checks complete; user authorized local commit. Portable in-memory catalog fixture tests cover direct/collective editions, activity, no-date, ordering, avatar; 210 web tests passed. Independent verification passed; ordering assertion normalized because SQL does not guarantee edition-array order. Native risk assessment unavailable due untracked-scope declaration; RDD off, independent verifier ran. T1 remains unchecked until its work-unit commit is recorded.

Evidence: Existing SQL returned 75 rows with ~196k VM steps on local.dev.db and 86 rows with ~1,023.7k on local.db. These are not Turso billed rows. No commits recorded yet.
