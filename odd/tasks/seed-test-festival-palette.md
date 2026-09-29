# Seed TEST edition and palette

Objective: In the SQL fixture only, relabel seeded active festival edition id 7 from VII to TEST, use slug `frijol-magico-test`, keep public name `Recolectando Semillas`, published flag, future dates, numeric IDs, participant links and poster assets unchanged. Give `ffm-test` the exact same palette values as `ffm-xvi` without altering XVI.

Authority: User explicitly selected seed only, NOT any existing database. No migration, no seed command against application DB, no remote/local database mutation. Do not touch uncommitted edits in root AGENTS.md, ActivityList.tsx or FestivalDetailContent.tsx. Keep unrelated archived task notes unchanged. Existing CSS fallback test uses single-selector parsing; add separate selector block for TEST rather than changing parser semantics.

TDD: not configured for this work; functional tests only. Exact commands: `bun run test --filter=@frijolmagico/database` and `bun run test --filter=@frijolmagico/web` from repository root. The seed contract test runs an isolated in-memory database; never execute a seed against a configured connection. No direct `bun test`. Delivery: no push, no PR; no commit requested for this change.

## Tasks

- [~] T1. Change the seed edition identity and stale comments (not relations), add an identity assertion to the isolated seed contract, duplicate XVI values for `[data-palette='ffm-test']` and assert exact CSS role equivalence. Writer: 75/75 database tests passed, web suite 219 passed/4 failed, `git diff --check` passed; independent verifier confirmed TEST/CSS identity and passing palette test. Web failures occur in pre-existing unstaged ActivityList/FestivalDetailContent UI changes (three stale heading/button assertions, one layout timeout), not in TEST seed/palette. These user UI edits are outside T1 scope and remain untouched. No commit. User selected wait for ongoing UI changes to stabilize; do not change UI tests or styles now. Re-run scoped web checks after UI stabilizes, then close T1.
