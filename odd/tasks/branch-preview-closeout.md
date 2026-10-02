# Branch Preview closeout

## Goal and scope
Close the authorized local changes on `refactor/database-staging-web-cache`, verify the integrated candidate, then validate cache behavior and catalog reads on an isolated Vercel Preview. No new Stage 5 implementation is defined.

## Authorization and constraints
User authorized committing existing OpenSpec deletions and `packages/database/.env.example` changes, Vercel Preview deployments, and read-only Turso CLI analysis/read verification. No Production deployment, DB write, migration, destructive DB operation, secret disclosure, or automatic PR scope expansion. Confirm Preview database isolation before deployment or measurements. Keep source writes single-threaded.

## Tasks
- [x] C1: Structurally verified and committed approved OpenSpec removal and environment example changes in `6bacb7b1e61b9acda96b4648f127501157d6e079` (`chore(repo): retire OpenSpec and update database env example`). Exact staged scope: eight deletions and environment example; 11 blank placeholders verified; diff check passed. Passive cleanup has no meaningful RED test.
- [ ] C2 (in progress): Verify integrated candidate with root Turbo tests, type-check, lint and diff checks. Initial root tests failed: Admin 829/829; Database 108 passed/1 failed, production config subprocess returned null exit status at ~10 seconds (`packages/database/tests/drizzle-target-config.test.ts:54`). Type-check passed 3/3; lint passed 3/3 with six warnings, no errors; diff check passed. Read-only scoped diagnosis/retry and full root confirmation pending; do not mark verified yet.
- [ ] C3: Inspect Vercel/Turso CLI access, Preview DB isolation, deployment routing and available attributable read metrics without exposing secrets. Resolve unsafe or ambiguous targets before deployment.
- [ ] C4: Deploy an isolated Preview candidate and validate Stage4 route output and cross-instance immediate/SWR invalidation using the existing runbook. Probe additions or staging record writes require explicit bounded scope; DB writes remain unauthorized.
- [ ] C5: Complete Catalog T6 read attribution, canonical/alias/fallback and rollout/rollback evidence if prerequisites permit. SQLite VM steps are not Turso billed rows.
- [ ] C6: Reconcile cache/catalog task evidence and report closeout status and delivery/review slicing recommendation. PR preparation remains separate from validation.

## Acceptance and evidence
Each completed task records observed checks and work-unit commit identity when applicable. Failed, skipped, inconclusive or blocked checks remain explicit. Native review follows the user-owned switch and candidate-specific consent; approval never authorizes Production.

Starting HEAD: `693c62252beccdae85aac5d407cd72c80b87da77`. Existing local changes: eight OpenSpec deletions and database environment example with empty R2/staging/production placeholders. Prior cache check: 1,226 tests and type-check passed before last integration, not fresh evidence.

## Progress
Read-only explorer confirmed documented prerequisites but could not execute commands in its role; no remote access or deployment occurred. Remote CLI readiness verification has been rerouted to `gentle-ai-verify`; local cleanup/integrated verification remains running separately. Documentation identifies `staging-frijolmagico`, but actual Preview binding and current quota remain unverified.

## Next step
Await structural cleanup and integrated check evidence; obtain fresh Preview/Turso metadata from command-capable verification. Do not deploy until safe routing is established.
