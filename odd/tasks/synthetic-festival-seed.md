# Synthetic festival seed

Goal: Keep a compact but representative SQLite seed with a published fixture edition slug `temp`, many synthetic participants, and artist alias/pseudonym/collective-history edge cases without identifiable personal data.

Scope: packages/database/seed/seed.sql and focused seed contract tests, plus narrowly necessary reference docs. No remote DB/SQL, staging creation, production dump, or changes to actual local.db/local.dev.db. Preserve migration files, schema, existing IDs/relations unless test evidence requires a separate authorized change. Preserve unrelated worktree files.

Constraints: Seed fixture is test/reference only, not a deployment copy of production. No individual names, ID numbers, private contact details, private addresses, social accounts or asset paths derived from real names; public festival/organization references may remain if safe. All modifications must preserve reproducible migration+seed bootstrap and foreign-key integrity. The festival route slug belongs to published `evento_edicion`, not `evento`.

- [x] S1 Inventory seed-dependent assertions, sensitive fields, festival edition and participant graph; choose narrow synthetic transformations and measurable checks. Check: identified complete-seed consumers, 80 artist INSERTs, 7 editions and 124 participation INSERTs; `temp` edition absent, privacy and alias/collective gaps confirmed.
- [ ] S2 Sanitize seed persons/history/contact data and add representative alias, pseudonym and published `temp` festival cases with numerous participants. Check: no identifying values by review, migration+seed bootstraps in disposable SQLite.
- [ ] S3 Add focused contract tests for fixture counts, integrity, privacy and edge cases, run package/root checks and independent verifier; document limitations. Check: all tests pass, no remote IO.

Progress: user authorized local implementation; S1 mapped. Existing tests activity-seed-contract and band-migration load the full seed; reset-dev-r2-lib references seed assets. Retain stable IDs and structural relationships, replace individual textual/identifier fields with clearly synthetic values, append one published `temp` edition with many seeded participations (or repurpose a rich existing edition without losing test volume), and add explicit aliases/pseudonyms and collective-member assignment. No remote operations authorized.
Next: S2; edit seed safely, inspect diffs for retained personal data without echoing values.
