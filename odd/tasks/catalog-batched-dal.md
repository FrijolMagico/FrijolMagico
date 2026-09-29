# Catalog batched DAL

Goal: Reduce Turso rows read without changing catalog output or introducing N+1 queries.

Scope: web catalog read path and required cache invalidation coverage; no production SQL or schema migration without measured evidence. Existing untracked files remain untouched.

- [x] T1 Characterize existing catalog SQL output and establish reproducible local baseline (queries, approximate SQLite work, exact output).
- [x] T2 Implement set-based catalog base/participation/date reads and composition behind existing repository contract; verify exact output and bounded query count.
- [ ] T3 Audit and correct admin-to-web invalidation for affected catalog dependencies; retain broad tags until freshness tests pass.
- [ ] T4 Measure combined reads and regression checks; switch repository and document rollback/evidence.

Verification: ODD TDD mode disabled by explicit user choice; functional tests via `bun run test --filter=@frijolmagico/web`. Local SQLite databases exist but are ignored, non-portable fixtures; tests must not depend on their presence. T1 route: delegated writer (multi-file preparation/write trigger). Delivery strategy: ask-on-risk; forecast >400 authored changed lines across all four tasks. User chose one feature branch and to decide PR slicing later. User authorized T1 local commit only.

T1 status: complete; work-unit commit `0872afcad7cc795c5257a8d90db0ce3be7cd9bd2` (`test(catalog): characterize legacy query output`). 210 web tests passed; independent verifier passed. Edition-array assertion normalized because legacy SQL has no guaranteed order.

T2 status: locally verified; user authorized local commit. Two fixed set-based reads now feed repository; legacy SQL retained for parity. 211 web tests and scoped type-check passed; independent verifier found no severe fixture-parity defect. SQLite VM steps: local.dev.db 196,000 legacy vs 21,400 batched; local.db 1,023,700 legacy vs 69,300 batched. This is not Turso billed rows; independent date cache and invalidation remain pending. Production rollout remains blocked pending T3/T4.

Evidence: Existing SQL returned 75 rows on local.dev.db and 86 on local.db. Production billed rows and full-data equivalence unverified.
