# Catalog batched DAL

Goal: Reduce Turso rows read without changing catalog output or introducing N+1 queries.

Scope: web catalog read path and required cache invalidation coverage; no production SQL or schema migration without measured evidence. Existing untracked files remain untouched.

- [x] T1 Characterize existing catalog SQL output and establish reproducible local baseline (queries, approximate SQLite work, exact output).
- [x] T2 Implement set-based catalog base/participation/date reads and composition behind existing repository contract; verify exact output and bounded query count.
- [x] T3 Audit and correct admin-to-web invalidation for affected catalog dependencies; retain broad tags until freshness tests pass.
- [ ] T4 Measure combined reads and regression checks; switch repository and document rollback/evidence.

Verification: ODD TDD mode disabled by explicit user choice; functional checks via `bun run test` and `bun run type-check`. Local SQLite databases are ignored, non-portable fixtures. All tasks use delegated writers and independent verification for multi-file edits. Delivery strategy: ask-on-risk; the user chose one feature branch and will decide PR slicing later. Local commits were separately authorized for T1, T2, and three T3 work units.

T1 status: complete; work-unit commit `0872afcad7cc795c5257a8d90db0ce3be7cd9bd2` (`test(catalog): characterize legacy query output`). 210 web tests passed; independent verifier passed. Edition-array assertion normalized because legacy SQL has no guaranteed order.

T2 status: complete; work-unit commit `d8a054ebefe98aeec152dedf27a65e66146f3763` (`perf(catalog): batch catalog participation reads`).

T3 complete locally: catalog-dependent participation, artist/pseudonym/collective/avatar, catalog order/restore, edition/date and event mutations now request remote catalog invalidation after relevant writes. Non-public and no-op changes avoid needless catalog purges. Existing public tags preserved. Root tests and type-check passed (709 admin tests at independent signoff, followed by 709 passing after the last artist fix). Independent verification found no remaining concrete invalidation gap. Commits: participation `2c7c7ca530533550a709b4fedb74a102346c42dd`, artist `fbe5ee23108685fbcd76fd3baa6292eeb012f329`; event/edition commit recorded after creation. Remote invalidation is best-effort, not an immediate-freshness guarantee.

Preview-build cost follow-up: user chose dev-branch previews on primary Turso, other previews on dedicated staging, production on primary. Branch-scoped Vercel environment variables and staging provisioning are not verified; do not switch routing until validated. Local SQLite files cannot serve Vercel preview deployments. Two fixed set-based reads now feed repository; legacy SQL retained for parity. 211 web tests and scoped type-check passed; independent verifier found no severe fixture-parity defect. SQLite VM steps: local.dev.db 196,000 legacy vs 21,400 batched; local.db 1,023,700 legacy vs 69,300 batched. This is not Turso billed rows; independent date cache and invalidation remain pending. Production rollout remains blocked pending T4.

Evidence: Existing SQL returned 75 rows on local.dev.db and 86 on local.db. Production billed rows and full-data equivalence unverified.
