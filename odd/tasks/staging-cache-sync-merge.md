# Integrate cache synchronization into staging

## Intent and authorization
User explicitly requested merging prior work through T8 into staging, then authorized analyzing and resolving conflicts. Target: staging at 475c3ca7. Source: refactor/admin-web-cache-sync at e6e1bba37c95da309e06c306d2c0514fd20da7fe. No push, PR, deployment, remote DB or production invalidation authorized. T9/T10 feature work remains separate.
Preserve the existing dirty odd/tasks/staging-branch.md; never stage it. User-selected destination staging overrides normal feature-branch destination for this integration only.

## Evidence and preservation rules
Read-only mapper muwscyly-3-1m72 compared source parent 8f5fa1c2 to staging (11 paths) separately from source sync commit (118 paths). Merge-tree predicts16 conflicted files; no actual merge has begun at document creation. No tests run yet.
Preserve staging tag-only catalog requests (no /catalogo path), artist-deletion participation tag, explicit festival-critical immediate mode in edition deletion, featured7-day TTL, package version4.13.1/scripts, generic assets/database/workflow changes. Integrate source awaited batches, success freshness metadata and existing-success SWR notices. No blanket ours/theirs or new business semantics. Inspect automatically merged catalog-update tests and asset response contracts.
Dirty-source tracking notes are historical; do not rewrite them during conflict resolution.

## Tasks
- [ ] M1 Integrate and resolve semantic conflicts, preserving both branches' intended behavior. Route: one delegated writer; multi-file/preparation trigger. Analyze evidence above is complete; resolution pending.
- [ ] M2 Independently verify integrated tests/types/lint and relevant auto-merges. Route: delegated verifier; command-running trigger. No meaningful test-first RED for Git integration: existing contracts and merged regression tests are the verification baseline; report failures honestly.
- [ ] M3 Review final staged scope and complete authorized merge commit, preserving unrelated local note. Route: parent Git-state operations. Native review only under user-owned switch. Record merge commit identity and remaining T9/T10 limitations.

## Delivery and workload
One user-requested integration merge, not a new PR or broad rewrite; accumulated source change118files +10391/-2015 is existing committed work. Resolution scope16 conflicts plus necessary auto-merged tests; keep edits minimal. No source feature additions.

## Checks
bun run test --filter=@frijolmagico/admin --filter=@frijolmagico/web
bun run type-check --filter=@frijolmagico/admin --filter=@frijolmagico/web
bun run lint --filter=@frijolmagico/admin --filter=@frijolmagico/web
git diff --check and staged conflict-marker scan; verify version/TTL/request modes and dirty-note unchanged.
Applicable builds/cache/browser proof remain T9/T10, not evidence from this merge.

## Progress
M1 in progress, partial: merge --no-commit started; writer muwsibqg-4-13kh resolved16 working-tree conflicts without staging. Index still unmerged; no merge commit. Writer reports admin1009 passed/3 failed, web passed; types passed after correcting transient extra braces; lint and diff check passed. The three failures are activity-dialog save contract and two participation cleanup source contracts. Outside writer surfaces does not establish unrelated/pre-existing causality. Independent read-only verifier muwu33h9-5-8v0q is diagnosing exact failures and reviewing preservation rules before any repair/staging/commit. Dirty staging note untouched per writer. Builds/live cache/browser/native review pending.
Independent diagnosis muwu33h9-5-8v0q reproduced12pass/3fail in dialog/cleanup/freshness checks; stale literal toast and BestEffort source assertions, no observed behavior regression. Separately34catalog/API/edition tests passed. Preservation checks confirm participation tag, immediate edition,7dayTTL,4.13.1/assetDTO. Bounded test-only writer muwu7msj-6-0d1v repairs only update-activity-dialog.contract.test.ts and server-action-cleanup.contracts.test.ts, retaining all behavior/scope assertions and rerunning focused/full tests/types/lint. Test-only repair muwu7msj-6-0d1v completed: focused RED12pass3fail then GREEN15pass0fail; full admin1012passed/both admin-web tasks successful; types/lint/diff passed. No production changes in repair. M1 implementation checks now pass, commit evidence pending within one integration merge. M2 independent verifier muwujk54-7-9b9d checks assertion preservation and focused tests; ASSESS unassessable due untracked tracking doc => unknown/high independent-verifier fallback. Independent verifier muwujk54-7-9b9d confirmed15focusedtests passed, assertions not weakened, diff/cached checks and tracked conflict scan passed. Parent staged16resolutions and2testrepairs; zero unmerged index paths,120stagedfiles +10402/-2013. Dirty odd/tasks/staging-branch.md remains unstaged. Native inspect before closure blocked on untracked-doc selection and projects unrelated dirty note; no START/lineage created. Shell gentle-ai command unavailable; facade works and ASSESS reported RDDon. Merge verification complete; commit/native candidate scoping pending.
