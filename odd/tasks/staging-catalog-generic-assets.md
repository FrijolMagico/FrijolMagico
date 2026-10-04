# Staging catalog generic assets

## Objective

Align the synthetic seed and the authorized staging database with generic, reusable artist and festival asset keys already represented by objects in the staging Cloudflare R2 bucket. Set exactly three catalog rows as featured and correct the seeded edition VII slug to follow `<festival-slug>-<edition-number>`.

## Scope and constraints

- Work on the current branch `refactor/database-staging-web-cache`.
- Modify only these repository files and the staging R2 bucket/database rows:
  - `packages/database/seed/seed.sql`
  - `packages/database/tests/synthetic-seed-contract.test.ts`
  - `packages/database/tests/activity-seed-contract.test.ts`
  - `packages/database/tests/reset-dev-r2-lib.test.ts`
- Use generic bucket keys with `<name>-<id>` segments, independent of artist/festival/edition identities. Reuse a bounded pool of existing assets across catalog rows.
- R2 has no atomic rename: copy to a new key, verify it, update references, then delete the old key only after confirming no live staging reference remains.
- Staging database changes must use direct, narrowly scoped transactions. Never execute the seed remotely, run migrations, access production, or pull/recreate `local.dev.db`.
- Preserve unrelated existing worktree changes and do not change branch. Coordinate any Git index/commit action with the other session currently working on this branch.
- Selected featured rows: catalog IDs 1, 2, and 3 (the first three by order; synthetic records have no semantic ranking).
- Generic asset naming plan: artist assets `artistas/asset-<NN>/avatar-<NN>.webp`; poster assets `festivales/asset-<NN>/afiche-<NN>.webp`. IDs identify reusable objects, not entities. Assign catalog rows deterministically in catalog order and reuse the pool as needed.

## Work unit

- [~] WU1 — Update the seed and its isolated contract test; copy and verify existing staging assets to generic keys; update staging catalog, artist-image, and edition references/featured flags in direct transactions; verify database, bucket, and CDN state; commit only the scoped source/task files on this branch.

## Acceptance criteria and checks

- Seed has exactly 38 catalog rows and exactly three featured rows (IDs 1–3).
- Catalog artist-image rows use only existing generic artist asset keys; edition poster URL/path fields use existing generic poster keys.
- Edition VII seed slug is `frijol-magico-vii`, derived from festival slug `frijol-magico` and edition number `VII` rather than the public edition name.
- Staging reflects the same featured selection and generic asset keys, with references verified against live object keys and CDN responses.
- No seed execution, schema migration, production access, local snapshot refresh, or unrelated file/index inclusion.
- Run `bun run test --filter=@frijolmagico/database` from the repository root and `git diff --check`; record all results honestly.

## Progress

- Test-first RED was observed because the fixture initially had no featured entries. The writer updated the seed plus directly affected tests. The first package run exposed two stale fixture expectations (old asset set and edition VII slug); after updating those directly affected tests, `bun run test --filter=@frijolmagico/database` passed (100 tests, 625 assertions) and `git diff --check` passed.
- Fresh read-only checks validated staging identity and exact inventory: 22 artist image objects and two poster objects; no target-key collisions. No staging artist-image row referenced a source artist object; both old poster keys were referenced and included in the remap. All 24 objects were copied to generic keys, checked by R2 object size/ETag, and returned CDN HTTP 200. Original keys remain until staging references are transactionally updated and verified.
- One guarded direct transaction committed to staging: updated 38 catalog artist-image URL/version pairs, set exactly catalog IDs 1–3 featured, and remapped `poster_url`, `poster_path`, and `poster_version` for all seven editions. Post-commit queries confirmed 3 featured rows, 38 generic catalog image rows, and 7 generic edition poster rows. Remote edition VII already had `frijol-magico-vii`; only the seed needed correction.
- After the staging transaction, verified across every schema table carrying `imagen_url`, `poster_url`, or `poster_path` that no references remain to old keys (the edition snapshot table is empty). Deleted the 24 old object keys and 18 obsolete directory-marker keys. The bucket now has 24 generic assets; R2 HEAD and CDN HEAD checks returned HTTP 200 for all 24 targets. Staging has no references to old keys.
- Source/test changes are ready for review and work-unit commit. Git index/commit remains paused pending confirmation from the peer session that previously requested no overlapping index operations; preserve its unrelated changes.
- Peer-session commit coordination is still pending; no staging, commit, or index operations will occur until that is resolved.
- Initial read-only audit found 38 catalog rows in both fixture and staging, all unfeatured; staging edition poster keys were available, while catalog artist image paths were synthetic. Fresh inventory and reference checks are required immediately before mutation.
- Route: delegated bounded writer for the seed and directly affected fixture tests (multi-file write; test-first), with the parent owning R2 and direct staging database operations.
- Delivery: one focused work-unit commit; no push or PR.