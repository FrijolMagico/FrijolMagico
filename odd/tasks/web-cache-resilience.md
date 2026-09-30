# Web cache resilience

Goal: Make public web cache regeneration safe and freshness event-driven, with granular invalidation aligned to actual query dependencies.

Context: Turso is currently unavailable and staging cannot yet be provisioned. Do not access Turso or Vercel as part of this work. Implement locally on the current branch and preserve unrelated worktree changes. User selected removal of all runtime mock datasets used by `apps/web`, including intentional development mock sources, and their exclusive generators. Preserve test mocks/fixtures and database seeds.

## Stage 1 — preserve valid data on read failures and remove runtime mocks

Scope:
- Public web database repositories must propagate read failures rather than turn them into mock data, empty successful values, or `null` where that would disguise an error.
- Successful empty query results remain legitimate empty results.
- Remove runtime mock datasets in Web and generators used exclusively by them. Keep test fixtures/mocks and database seeds.
- Cover error, valid-empty, and populated results with deterministic tests.
- No changes to cache lifetime profiles, admin-to-web invalidation policy, freshness classification, tag/query granularity, snapshots, or Turso/Vercel configuration in this stage.

Acceptance:
1. Catalog read failure propagates; successful empty base result stays empty; no mock is substituted.
2. Festival listing, festival detail, adjacent-festival, and About database read errors propagate rather than becoming empty/null/mock results.
3. Explicit runtime mock-source selections are removed for the affected Web repositories.
4. Runtime mock dataset modules and their exclusive synthetic-data utilities are deleted; tests, fixtures, seeds, and unrelated admin mocks remain.
5. Focused deterministic tests pass and the final diff does not include unrelated pre-existing changes.

Tasks:
- [x] Implement Stage 1 repository behavior and tests; remove approved runtime mocks/generators.
- [x] Run independent focused verification and record exact results.

Implementation result: database read failures propagate from catalog, festival listing/detail, adjacent festivals, About, and festival slug loading; successful empty results retain their domain-appropriate empty representation. Runtime Web mock source selections and mock-slug fallback were removed. Removed four runtime mock datasets and `apps/web/src/infra/__mocks__/mockDataUtils.ts`; test mocks/fixtures and DB seeds remain.

TDD evidence: RED observed (9 expected failures); GREEN observed in the delegated writer and independently reproduced after deletions.

Verification: `bun run test --filter=@frijolmagico/web` — 236 passed, 0 failed. Type-check/build not run. No Turso/Vercel access. No commit created; explicit user commit authorization was not given. Independent verifier confirmed candidate scope and behavior; unrelated pre-existing `odd/tasks/catalog-batched-dal.md` modification and `odd/tasks/participation-status-visibility.md` untracked file were preserved.

Status: Stage 1 implementation verified locally; commit/delivery remains pending explicit authorization. Stages 2–4 remain to be defined.
