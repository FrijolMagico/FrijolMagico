# Offline staging readiness

Goal: Prepare explicit staging/production command isolation, a guarded future staging seed procedure, and a launch checklist without touching Turso or existing local snapshots.

Branch: `refactor/database-staging-web-cache` (current branch at request; contains prior synthetic seed commits). Preserve unrelated admin test and catalog/cache task worktree changes.

Constraints: no remote CLI/SQL, no real tokens or environment values in tests/logs, no existing `local.db` / `local.dev.db` writes, no Vercel credential changes or preview, no push. Keep Drizzle Kit as the migration executor and each database's independent migration history. Never auto-load production credentials for staging.

- [x] E1 Isolate command entrypoints from Bun's automatic `.env.local` loading with explicit, fail-closed destination selection; prove with fake env files/CLIs and verify explicit target requirements remain. Check: 109 database tests pass. Explicit `bun --no-env-file run ...` avoids Bun loading generic credentials in parent and child; ordinary `bun run ...` still intentionally fails closed.
- [ ] E2 Prepare a bounded, explicit staging-only synthetic seed population procedure for later separate authorization. Ensure migration history is created by Drizzle first; never seed production or an existing populated destination; test offline with fake CLI or disposable SQLite. Check: no actual Turso calls and FK/fixture counts pass.
- [ ] E3 Write an actionable checklist for destination identity, migration history, seed fixture, Vercel branch variables and measured rows read, distinguishing local checks from remote authorization gates. Check: review documentation for unproven claims; root tests/type-check.

Discovery: On Bun 1.4.2 inside `packages/database`, default `bun -e` sees generic credentials from `.env.local`; `bun --no-env-file -e` does not, and the shell itself has no generic variables. Current remote migration script rejects generic `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`, as does snapshot pull. Current branch contains commits dcf21edd and df96e42e; unrelated admin tests are modified. No remote operation performed.

Progress: E1 package scripts use nested `--no-env-file`, README documents parent `bun --no-env-file run`, and two fake-CLI tests prove default fail-closed versus explicit success. 109 database tests passed. Root type-check failed in unrelated generated `apps/web/.next/dev/types/validator.ts` importing absent `cache-smoke-local/route.js`; database scoped type-check passed.
Next: E2 staging-only population plan and offline tests; do not invoke Turso.
