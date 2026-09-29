# Festival schedule timeline

Objective: Replace the festival activity type-column layout with a full-width, bounded-scroll timeline by day and type, retaining existing festival identity, links, disclosure and occurrence-specific registration.

Baseline: feature branch `refactor/festivals-detail-ui` at `d37b1f66` (synced with origin/dev). User-approved reference: `/tmp/.wsl-screenshot-cli/e516f546cb0c8d6bd1a20eafd145eac905c67ad2872227e349312d4545cc0eeb.png`.

Constraints: No new routes; preserve participant layout and existing activity actions. Simultaneous overlapping intervals occupy as many columns as needed; expanding one card increases its row height and pushes subsequent rows within the scrollable schedule. Display approximately five collapsed rows in the scroll viewport; controls stay outside. On active editions only, show undated/unscheduled activities in a 'Horario por confirmar' group; omit them for past editions. Music uses the same card presentation and a music badge at its time. On narrow screens, preserve readable cards and avoid forced narrow columns. Nullable occurrence start/duration and per-occurrence registration URL are part of the current contract.

TDD: not enabled by an identified project/session configuration; use ordinary functional checks. Test runner: `bun run test --filter=@frijolmagico/web` (repository requires Turbo, never direct `bun test`). Delivery: feature-branch-chain selected by user; forecast ~450-750 authored changed lines. First slice is T1 model plus tests; second slice starts after T1 boundary. No push or PR authorized. Native RDD switch: off.

## Tasks

- [x] T1. Model day/type schedule and overlap layout with focused tests. Route: delegated worker (multi-file writer). Check: date ordering, cross-type interval overlap, multiple occurrences, null times, active/past handling, music and occurrence-specific registration mapping. Evidence: `bun run test --filter=@frijolmagico/web` passed 213 tests (worker); parent readback corrected cross-type concurrency. Commit: `f87b2ae1`.
- [x] T2. Compose full-width scrollable timeline UI and responsive cards with focused component tests. Route: delegated worker (multi-file writer). Check: day/type selection, dynamic columns, card expansion reflow, approximately five collapsed rows, keyboard/scroll affordance, existing actions and active-edition behavior. Evidence: `bun run test --filter=@frijolmagico/web` passed 218 tests; `bun run lint --filter=@frijolmagico/web` passed with pre-existing warnings and one T2 unused-helper warning corrected afterward. Visual/browser verification and stale `.next` type-check errors remain T3. Commit: pending identity.
- [~] T3. Verify scoped and applicable full tests/type/lint and review visual layout against reference, then resolve any findings. Route: delegated verifier for commands. Evidence: pending. Commit: pending if corrections needed.

Next: commit T2, then investigate generated `.next` type-check errors and verify layout visually. A transient Bun SIGSEGV occurred on one run, with subsequent successful run; cause unknown. Turbo generated an incidental AGENTS.md managed block during tests; excluded from T1 commit.
