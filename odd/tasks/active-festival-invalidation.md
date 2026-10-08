# Active festival invalidation

## Objective / scope
Approved active-only topbar/banner invalidation for event create/update/delete and edition save/publication/delete (1–4), preserve detail/list. Exclude5–7, original Suspense cause, midnight refresh, artwork and selection tie changes.

## Branch / delivery
Current fix/active-festival-invalidation HEAD3a0c1e74d01b96049437005a0b61444de959d0b3. Target refactor/database-staging-web-cache local HEADd1fe8201490451c07e045a2ee5b37ccbac8d9b60. Merge also brings existing user database-script commit3a0c1e74; preserve it. User explicitly confirmed two commits and local merge, no push. Foundation commit e609f427 created. Integration commit identity: fix/active-festival-invalidation tip with subject fix(cache): isolate active festival display invalidation; exact resulting hash recorded in Engram delivery evidence after commit. No reset/remote DB/deploy/push performed. New user change to root package.json discovered before delivery, excluded and preserved (blob f31b13af8ecf31619026bb201725adc4ece45c80). Review strategy feature-branch-chain, foundation then integration; PRs only to dev if requested. Actual24code/test files1338 authored diff lines (801tracked+537new), task doc excluded.

## Implemented design
Existing critical readers unchanged. Dedicated remote topbar/banner projection/tag festivales:activo:display. Admin transaction-scoped before/after selected identity/name/number/slug/dates/places, awaited immediate delivery after changed commit; create parent event skips active reads. Removed shell-only root page/layout calls; kept detail/list and static/podcast/empty-days fallback. Web2SELECT read transaction and comparator stable date ordering preserve equal-date venue order. HTTP failure logged, not rollback.

## Tasks
- [x] AFI-1 — Map verified.
- [x] AFI-2 — Foundation RED/GREEN, projection tests and compiler verified; commit e609f427 (feat(cache): add active festival display projection),4 files332 additions.
- [x] AFI-3 — Reader/six-action integration verified,5–7 untouched; commit identified by feature branch tip and exact conventional subject above, exact hash in delivery memory.
- [x] AFI-4 — Local checks/review closed. Independent musvwc71-a-awj0 exact forced lint3/3 no warnings; forced tests database104/0 web278/0 admin835/0,3/3 successful sequential no retries; diff-check clean,index empty. Fresh forced typecheck3/3 previously passed after corrections. No remaining concrete defect in bounded check. Preview/browser/live remote behavior pending, not claimed verified.

## Native review evidence
review-756e3e4730408100, candidate sha256:17a18506ed83be38e8ec5157468c07b6e0f68e7b2e57a76580a8f3039da55943, frozen tree58426ba4a96e775878051245dcaf7c61420e38a6,24files1338lines/high.4lenses approved; exact acknowledgement completed authority burned, consumed revision sha256:a26a7fd99e7e9458f32489006960a9ec790e86be0d67370911578a3827e4a690. R3-001/R4-001 banner index.tsx:6 WARNING informational separate nonblocking followups; full detail unavailable, don't invent. No STATUS after burn; reviewed source unchanged. Approval not delivery authority.

## Failures / pending checks
Earlier concurrent database run6timeouts, later exact standalone pass; correction run1fixture timeout then same-command pass. Final independent run no retry. Initial admin8legacy assertion failures repaired with explicit new contract tests; final835green. Installed Turbo docs missing fallback reported. No additional build requested; Preview functional validation/browser not run and original Suspense not declared fixed.

## Next
Delivery authorized: integration commit then fast-forward-only local merge to refactor/database-staging-web-cache, no push; stop on conflicts rather than reset/force. Record resulting integration/merge tip in Engram delivery evidence. Preserve unrelated root package.json change. Preview validation remains separate and requires authorization.
