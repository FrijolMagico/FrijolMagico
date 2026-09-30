# Synthetic festival seed

Goal: Keep a compact but representative SQLite seed with 70 synthetic artists, 38 catalog entries, a published fixture edition slug `temp` with 60 participations, and artist alias/pseudonym/collective-history edge cases without identifiable personal data.

Scope: packages/database/seed/seed.sql and focused seed contract tests, plus narrowly necessary reference docs. No remote DB/SQL, staging creation, production dump, or changes to actual local.db/local.dev.db. Preserve migration files, schema, existing IDs/relations unless test evidence requires a separate authorized change. Preserve unrelated worktree files.

Constraints: Seed fixture is test/reference only, not a deployment copy of production. No individual names, ID numbers, private contact details, private addresses, social accounts or asset paths derived from real names; public festival/organization references may remain if safe. All modifications must preserve reproducible migration+seed bootstrap and foreign-key integrity. The festival route slug belongs to published `evento_edicion`, not `evento`.

- [x] S1 Inventory seed-dependent assertions, sensitive fields, festival edition and participant graph; choose narrow synthetic transformations and measurable checks. Check: identified complete-seed consumers, 80 artist INSERTs, 7 editions and 124 participation INSERTs; `temp` edition absent, privacy and alias/collective gaps confirmed.
- [x] S2 Sanitize seed persons/history/contact data and add representative alias, pseudonym and published `temp` festival cases; reduce to 70 artists, 38 catalog entries and 60 `temp` participations per latest user clarification. Check: independent privacy/behavior audit found no severe defect; 107 package tests pass with disposable SQLite and foreign-key check.
- [ ] S3 Add focused contract tests for fixture counts, integrity, privacy and edge cases, run package/root checks and independent verifier; document limitations. Check: all tests pass, no remote IO.
- [x] B1 Resolve pre-existing root type-check errors in database migration script/test without changing their remote behavior; re-run root check before closing S2/S3. Check: root type-check and 107 database tests passed after explicit child-environment typing.

Progress: S1 mapped and committed 97c91e9b. S2 has 70 synthetic artists, 38 catalog entries and 60 participations in published `temp` over two days; alias, pseudonyms and inactive collective history remain. Database tests: 107 passed, 0 failed; independent read-only audit found no severe seed defect. B1 fixed inherited root type-check failures without remote behavior changes; root type-check now passes. No remote operations authorized.
Next: complete S3 readback and commit scoped work units; do not touch Turso or existing local snapshots.
