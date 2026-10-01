# Integrate current branch with remote dev

## Goal
Integrate the fetched `dev` tip (`591bf7051e2a7d3a2fa6e7521f929824ea76fb59`) into `refactor/database-staging-web-cache` (`68c086b9ddf935baa6c35fe86df6cebd61af4f02`), preserving local work and resolving conflicts without losing either branch's intended behavior.

## Constraints
- Preserve the existing modified and untracked worktree files.
- Integrate remote UI/design changes for participation dialogs, optional talk presenters, and festival timeline.
- Preserve the branch's synthetic database seed design; merge only compatible upstream fixture/schema intent.
- Verify the competing migration history against the user-named database before selecting canonical order.
- Do not run remote migrations or write to any database without separate explicit authorization for that target.
- Run project checks after conflict resolution and report any blocked checks.

## Tasks
- [x] Inspect deployed `db-frijolmagico` migration identity and resolve the migration-order decision: `0026_talk_presenter` is applied at `1785715200000`; preserve it as 0026.
- [x] Preserve existing dirty/untracked working-tree changes in a targeted stash; do not include this task document.
- [x] Merge fetched remote `dev` and resolve all five conflicts, retaining upstream design behavior and branch-specific synthetic fixtures. Preserve deployed `0026_talk_presenter`; move collective-member pseudonyms to 0027.
- [x] Verify migration metadata, conflict markers, and focused tests: admin 798/798, web 272/272, database 109/109; staged and unstaged diff checks clean. No unresolved paths or conflict markers; idx 26/27 match deployed production order.

## Deferred staging work
A read-only query for the user-named `staged-frijolmagico` returned `database not found`; do not guess another target. No staging migration was run. Confirm the exact visible Turso staging database and separately authorize any remote migration/reconciliation; its prior 0026 collective migration may not be safely replayable after the order change.

## Evidence
- Integration merge commit: `f802d465fe738b3fa6374537aa34a9130bccdebd` (`merge(dev): integrate remote dev updates`).
- Validation and follow-up record: `09feaacb8ed2aba850e33ca3f1600951a2eda6c2` (`docs(odd): record dev integration evidence`).

## Native review status
The native preflight rejected the branch-wide candidate with `lens_context_budget_exceeded` before creating review authority. It requires smaller review candidates; no review was started or acknowledged.
