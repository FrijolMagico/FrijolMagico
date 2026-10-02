# Database staging snapshots

Goal: Make local database files reproducible, real-data snapshots of their corresponding Turso databases, and keep remote schemas aligned through guarded, explicit migrations.

Problem: The current seed recreates local.dev.db, production snapshots are manual, and migrate silently accepts whichever credentials .env.local supplies. Production and staging must remain separate; no accidental remote writes or exposure of snapshot data.

Scope: packages/database scripts/tests/docs and necessary root command wiring only. No Turso creation, remote SQL, remote migration, production export, credential changes, push, preview, or deployment. Do not touch odd/tasks/participation-status-visibility.md or unrelated catalog source.

Constraints: local.dev.db = real staging snapshot; local.db = real production snapshot; bun run dev/prod serve these local files; both remote databases consume the same versioned migration set via separate guarded commands. Never copy secrets or database contents into Git. Do not infer billed rows of .dump versus db export absent provider evidence. Preserve existing seed data only as needed for tests while retiring destructive public seed workflow.

- [x] D1 Implement explicit safe local snapshot refresh commands for staging and production, with temporary-file validation, atomic replacement, and strict target selection. Check: 90 database tests passed with fake Turso; independent recheck found no remaining high-severity issue. No remote operations.
- [x] D2 Implement separately gated staging and production migration commands using the common migration set, with destination verification and no implicit dual-target production write. Check: 100 database tests passed; independent recheck found no severe defect. No remote migration.
- [x] D3 Remove obsolete public seed workflow safely, update database documentation and package commands, run tests/type-check and independent verification. Check: 102 database tests and scoped type-check passed; independent verifier found no severe regression. `.dump`/export uncertainty and snapshot privacy documented.

Progress: D1 implemented and independently verified; work-unit commit ddbdb631. Pull commands import `.dump` via sqlite3 into a private ignored temp directory, validate integrity, foreign keys, migration timestamps and minimum app schema, and replace only the selected local snapshot; WAL/SHM sidecars are rejected. D2 implemented and independently rechecked: explicit target scripts, no implicit root migration, production confirmation, and independent read-only Turso CLI identity check even for direct Drizzle config migration. Remaining limitations: actual CLI behavior is unverified against Turso; a valid dump cannot prove source identity, and concurrent local DB users remain unsafe. Existing unrelated worktree changes are preserved. No remote migration/export authorized.

D2 work-unit commit: dfdd22e7. D3 work-unit commit: b076f9c1. D3 retires the seed entry point and public R2 reset command (legacy manual reset aborts if a real staging snapshot exists), updates root/package docs and preserves seed.sql as a test fixture. Final local check: 102 database tests, database scoped type-check, git diff --check; scripts and drizzle config are not included in package tsconfig. No remote operations were performed.

Next step: request separate authorization for staging provisioning/data migration and production snapshot/export; verify real CLI behavior and preview credential isolation before any deployment.
