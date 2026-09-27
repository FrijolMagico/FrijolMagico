# Shared Santiago timezone utilities

## Objective
Share the activity-registration timezone contract between Admin and Web: Admin continues converting `America/Santiago` wall time to canonical UTC for persistence and reads it back as local fields; Web renders UTC registration deadlines as Chilean local date/time. Preserve the DB UTC contract and all current user UI edits.

## Rationale
Admin currently owns its Temporal-based timezone helpers while Web displays `end_at` directly as a raw UTC string. Duplicated app-local timezone rules risk divergence. Put shared pure conversions in `@frijolmagico/utils`; keep Web display formatting on native `Intl` so the browser-facing import does not load the Temporal polyfill.

## Scope and constraints
- In scope: shared timezone/formatting utilities and tests, Admin migration to shared helpers, Web deadline formatting and tests, necessary workspace dependency/export/lock updates.
- Out of scope: database schema/data/migrations, changing UTC timestamp storage or registration-window comparison semantics, rewriting existing user UI changes, poster URL changes, cache behavior.
- Preserve Admin DST gap/fold rejection, millisecond `Z` output, validation/error behavior, and form round trips.
- Web renders in `America/Santiago` using a stable Chilean date/time format; keep raw UTC strings in the DTO and comparison logic.
- Preserve the current dirty working tree; do not revert or overwrite unrelated UI/poster changes.
- No commit, push, or PR without explicit user authorization.

## TDD and route
- TDD: strict RED/GREEN/REFACTOR; existing tests and prior authorization establish the root Turbo runner `bun run test --filter=<workspace>`.
- Route: one bounded delegated writer because this spans shared package, Admin, and Web files. Parent remains responsible for scope reconciliation and verification.
- Existing OpenSpec `edition-activity-application` remains untouched; user did not select an SDD phase in this request.

## Tasks
- [x] **T1 — Extract shared Santiago timezone conversion.** Added tests first, moved pure local↔UTC conversion behavior into the `@frijolmagico/utils/santiago-time` subpath, placed Temporal/polyfill dependency in utils, and migrated Admin without changing validation, persistence, or form behavior.
- [x] **T2 — Localize Web deadline display.** Added the native-Intl formatter in `@frijolmagico/utils/santiago-date-format` and tests; used it only for visible `ActivityItem` deadline text, preserving user UI changes, DTO values, and UTC active-window logic.
- [x] **T3 — Verify integrated behavior.** Ran the scoped Turbo suites for utils, admin, and web, type-check/lint for available app tasks, and `git diff --check`; recorded results below.

## Acceptance criteria
- Shared utilities define the only `America/Santiago` conversion rules used by Admin and Web display.
- Admin local-time input is still DST-aware and persists canonical UTC `...sssZ`; Admin edit fields reconstruct Santiago local date/time.
- Web shows a stable Spanish local deadline (`dd/MM/yyyy HH:mm` plus the UI's `hrs` suffix) for the given UTC instant, independent of host timezone, with no UTC `Z` leakage.
- Web client does not import/load the Temporal polyfill solely to format a date.
- UTC comparisons, inclusive registration-window boundaries, CTA/badge behavior, DB schema/data, and in-progress UI edits remain unchanged.

## Progress and evidence
- T1–T3 completed by one bounded writer, followed by independent verification.
- RED: new utility/Admin/Web regression tests failed before implementation as expected. Initial Admin/Utils execution also exposed a stale workspace module resolution after the manifest/lock update; `bun install --frozen-lockfile` synchronized workspace links successfully without changing lockfile contents.
- GREEN: `bun run test --filter=@frijolmagico/utils` — 16 passed; `bun run test --filter=@frijolmagico/admin` — 515 passed; `bun run test --filter=@frijolmagico/web` — 155 passed.
- `bun run type-check --filter=@frijolmagico/utils --filter=@frijolmagico/admin --filter=@frijolmagico/web` passed for Admin and Web; Turbo has no type-check task for Utils.
- `bun run lint --filter=@frijolmagico/utils --filter=@frijolmagico/admin --filter=@frijolmagico/web` passed for Admin and Web with 4 Web warnings and no errors; Turbo has no lint task for Utils.
- `git diff --check` passed. Web uses only the native Intl formatter subpath; no Web source imports the Temporal subpath or polyfill. UTC comparison/hook semantics unchanged.
- Follow-up after user UI redesign: updated `ActivityItem.test.tsx` to assert the single top-right CTA rather than the removed Badge and expanded-only link, preserve URL/window/focus/music safety coverage, and account for the `<strong>`/`hrs` markup. The complete Web suite passes 155/155; diff check passes.
- Existing OpenSpec WU6 design/tasks still prescribe the old Badge plus expanded CTA. They were intentionally not edited or marked closed in this turn because no current-session SDD preflight block is present; this artifact mismatch remains before formally advancing to WU7.
- Native `gentle_review assess` was unavailable due to untracked files; its returned plan required an independent verifier, which passed the commands above.
- User's unrelated dirty UI/config/poster changes were preserved; no DB/schema changes and no commit/push/PR.
- Current branch: `feat/edition-activity-application`.
- Existing OpenSpec tracks activity registration work; it was preserved unchanged because this request used ODD, not an SDD phase.

## Next step
The shared timezone implementation is ready for user review. Browser visual behavior and real DST runtime behavior were not separately exercised beyond unit tests.