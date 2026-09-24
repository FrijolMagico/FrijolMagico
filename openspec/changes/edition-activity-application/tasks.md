# Implementation Tasks: Edition Activity Registration

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 900–1,300 changed lines across database, admin, web, dependencies, migrations, and tests; re-estimate for CTA/Badge reuse |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | Child PR 1: database persistence → child PR 2: admin validation/timezone/aggregate → child PR 3: admin dialogs → child PR 4: public data → child PR 5: reusable web CTA/Badge and client UI; adjust once after measuring cohesive slices |
| Delivery strategy | feature-branch-chain (user approved) |
| Chain strategy | draft/no-merge tracker PR to `dev`; child PR #1 to tracker branch, each later child to immediately preceding branch |

Decision needed before apply: Explicit user authorization to begin apply remains required; delivery strategy is settled.
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

**Apply gate:** This document is planning only. Stop before implementation/apply until the user explicitly authorizes apply. No branch, issue, PR, publication, label, rebase, or `size:exception` is implied or performed by this plan.

## Constraints and verification baseline

- Use strict TDD in every work unit: RED → GREEN → TRIANGULATE → REFACTOR.
- Use `bun run test`; do not use root `bun test` as the verification command.
- Final quality commands are `bun run test`, `bun run type-check`, and `bun run lint`.
- Keep tests with the behavior they verify and keep each work unit independently reviewable and rollbackable; group units into cohesive child PRs only after measuring each diff.
- The only planned migration file is the additive forward SQL migration; create no rollback SQL file. Operational rollback can leave the table in place.
- Use `@js-temporal/polyfill` while complete native Temporal support is unavailable; retain strict `America/Santiago` DST rejection and UTC ordering tests.
- Technical artifacts and task names are English; user-facing validation/UI labels remain Spanish.

## Work Unit 1 — Database registration schema and defenses

**Depends on:** none. **Expected boundary:** additive database contract only.

**Expected files:**
- `packages/database/src/db/schema/participations.ts`
- `packages/database/src/db/relations.ts`
- `packages/database/src/db/types.ts`
- `packages/database/migrations/0021_activity_registration.sql`
- `packages/database/migrations/meta/_journal.json` and generated Drizzle metadata, if produced by the repository workflow
- `packages/database/tests/activity-registration.test.ts`

- [x] RED: Add migration/integration tests for exact table and columns, required values, one-to-one uniqueness, cascade deletion, HTTPS/canonical-instant/order defenses, music rejection/cleanup triggers, and `updated_at` behavior. <!-- sdd-owner: implementation -->
- [x] GREEN: Add the `activity_registration` Drizzle table, one-to-one relations, inferred types, only the additive forward migration checks/triggers, and migration metadata without a rollback SQL file or URL/start/end indexes. <!-- sdd-owner: implementation -->
- [x] TRIANGULATE: Run the database test scope through the repository-supported command and inspect generated SQL/schema metadata; verify direct parent deletion and direct music transitions cannot leave a registration row. <!-- sdd-owner: implementation -->
- [x] REFACTOR: Align constraints, trigger naming, timestamp representation, and migration formatting with existing database conventions without changing behavior. <!-- sdd-owner: implementation -->

**Verification commands:** `bun run test --filter=@frijolmagico/database` (or the repository-supported database test target), `bun run type-check`.

## Work Unit 2 — Admin validation and Chile timezone conversion

**Depends on:** Work Unit 1 persistence representation. **Expected boundary:** pure input contract and conversion utilities; no aggregate action wiring yet.

**Expected files/discovery targets:**
- `apps/admin/src/app/(core)/eventos/participaciones/**/_schemas/activity.schema.ts`
- `apps/admin/src/app/(core)/eventos/participaciones/**/_lib/activity-registration-time.ts`
- `apps/admin/package.json` and Bun lockfile
- adjacent tests under `apps/admin/tests/unit/app/(core)/eventos/participaciones/`

- [x] RED: Add schema tests for all-empty normalization, complete configuration, every partial combination, HTTPS-only URLs, malformed URLs, equal/reversed windows, and music exclusion at the normalized/action-input boundary. <!-- sdd-owner: implementation -->
- [x] RED: Add timezone tests for `America/Santiago` standard/DST offsets, nonexistent and ambiguous local instants, strict component parsing, UTC millisecond serialization, ordering, and UTC-to-Chile form-default round trips. <!-- sdd-owner: implementation -->
- [x] GREEN: Add the accepted direct `@js-temporal/polyfill` dependency while native Temporal support remains incomplete, complete-or-absent registration schema, and server-only timezone conversion/inverse-default utility using Temporal disambiguation `reject`. <!-- sdd-owner: implementation -->
- [x] TRIANGULATE: Run the scoped admin tests and confirm no host-local timezone or fixed-offset behavior is involved; verify malformed/unsafe input fails without database access. <!-- sdd-owner: implementation -->
- [x] REFACTOR: Consolidate reusable validation messages and types while preserving strict TypeScript and the existing `ActionState`/form conventions. <!-- sdd-owner: implementation -->

**Verification commands:** `bun run test --filter=@frijolmagico/admin`, `bun run type-check`.

## Work Unit 3 — Atomic admin create/update aggregate mutations

**Depends on:** Work Units 1–2. **Expected boundary:** authoritative admin persistence and rollback behavior, including cache invalidation.

**Expected files/discovery targets:**
- `apps/admin/src/app/(core)/eventos/participaciones/**/_actions/activities/create-activity.action.ts`
- `apps/admin/src/app/(core)/eventos/participaciones/**/_actions/activities/update-activity-aggregate.action.ts`
- existing separate activity update actions referenced by `update-activity-dialog.tsx`
- existing cache/revalidation helpers and adjacent aggregate action tests

- [x] RED: Add action tests for create with/without registration, update create/update/delete, absent configuration clearing, forged music configuration rejection, band/type normalization, ownership checks, detail upsert, eligible-to-music cleanup, and post-mutation failure rollback. <!-- sdd-owner: implementation -->
- [x] RED: Add cache tests proving required admin/public tags are attempted only after commit, are complete on success, and are absent after rollback. <!-- sdd-owner: implementation -->
- [x] GREEN: Extend create and implement the single update aggregate transaction: resolve authoritative type/ownership, convert validated values, mutate participation/activity/detail/registration coherently, explicitly clear music registration, and invalidate caches post-commit. <!-- sdd-owner: implementation -->
- [x] GREEN: Remove or migrate the dialog-path non-atomic update sequence so no alternate save path remains for the same aggregate. <!-- sdd-owner: implementation -->
- [x] TRIANGULATE: Run scoped admin tests with injected failures after each transaction mutation; verify prior coherent state, no cache invalidation on rollback, and all required tags after commit. <!-- sdd-owner: implementation -->
- [x] REFACTOR: Simplify transaction helpers and error mapping, document trigger/application defense-in-depth, and retain safe Spanish validation errors without weakening server authority. <!-- sdd-owner: implementation -->

**Verification commands:** `bun run test --filter=@frijolmagico/admin`, `bun run type-check`, `bun run lint`.

## Work Unit 4 — Admin read model and dialogs

**Depends on:** Work Units 2–3. **Expected boundary:** form presentation and submission wiring; consumes the aggregate action rather than introducing persistence behavior.

**Expected files/discovery targets:**
- `apps/admin/src/app/(core)/eventos/participaciones/**/_lib/data-access-layer/get-activities-with-details.ts`
- `apps/admin/src/app/(core)/eventos/participaciones/**/_types/activity.types.ts`
- `apps/admin/src/app/(core)/eventos/participaciones/**/_types/participations.types.ts`
- `apps/admin/src/app/(core)/eventos/participaciones/**/_lib/participation-composer.ts`
- `apps/admin/src/app/(core)/eventos/participaciones/**/_components/create-activity-dialog.tsx`
- `apps/admin/src/app/(core)/eventos/participaciones/**/_components/update-activity-dialog.tsx`
- adjacent admin dialog/contract tests

- [ ] RED: Add read-model and component tests for empty/update Chile-local defaults, registration join absence, music hiding/clearing, complete submission wiring, and forged payload coverage at the action boundary. <!-- sdd-owner: implementation -->
- [ ] GREEN: Left join registration in admin activity reads, propagate optional defaults/types/composer data, add registration fields, hide and clear them for music, and submit the aggregate action. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: Run admin tests and manually inspect the rendered form contract for create/update, canonical round trips, reset/refresh behavior, and no client-only eligibility trust. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: Keep dialog changes limited to registration presentation and aggregate submission; remove duplicated state transformations and preserve existing form accessibility conventions. <!-- sdd-owner: implementation -->

**Verification commands:** `bun run test --filter=@frijolmagico/admin`, `bun run type-check`, `bun run lint`.

## Work Unit 5 — Public SQL, repository mapping, and DTO propagation

**Depends on:** Work Unit 1 and the admin persistence contract. **Expected boundary:** public serialized data, with no client visibility logic.

**Expected files/discovery targets:**
- `apps/web/src/app/**/festivales/**/[slug]/adapters/queries/festivalDetailQuery.ts`
- `apps/web/src/app/**/festivales/**/types/festival.ts`
- `apps/web/src/app/**/festivales/**/[slug]/adapters/mappers/festivalDetailMapper.ts`
- repository fixtures/mocks and adjacent query/mapper tests

- [ ] RED: Add tests for the exact left join, nested nullable registration object, absence of current-time SQL predicates, mapper/DTO propagation, missing-row `null`, and music-path exclusion. <!-- sdd-owner: implementation -->
- [ ] GREEN: Add the left join and registration JSON selection, extend public types/mappers/fixtures, and preserve `MusicActivityItem` routing without computing active state server-side. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: Run the scoped web tests and inspect generated/query fixtures to verify inactive registrations remain serialized and no browser database request is required. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: Normalize nullable mapping and fixture helpers; avoid broad DTO or catalog/artist changes. <!-- sdd-owner: implementation -->

**Verification commands:** `bun run test --filter=@frijolmagico/web`, `bun run type-check`.

## Work Unit 6A — Reusable web CTA and Badge treatments

**Depends on:** none. **Expected boundary:** web visual primitives and narrow reuse at existing navigation links; no activity timing behavior.

**Expected files/discovery targets:**
- `apps/web/src/components/ui/button.tsx` (read-only pattern reference; native button, no `asChild`)
- `apps/web/src/components/LinkBtn.tsx` (read-only text-link reference)
- `apps/web/src/components/top-bar-info/TopBarInfoClient.tsx`
- `apps/web/src/app/(sections)/festivales/components/FestivalTimelineCard.tsx`
- `apps/web/src/app/(home)/components/NewBadget.tsx` (read-only visual reference; hardcoded label)
- `apps/web/src/components/link-cta.tsx` and `apps/web/src/components/badge.tsx`
- adjacent web component tests

- [ ] RED: Test semantic anchor CTA variants, preserved top-bar/timeline labels and placement, no button nesting, visible keyboard focus, and readable default/hover/focus contrast; test reusable Badge as a non-interactive `span` accepting content without a tab stop. <!-- sdd-owner: implementation -->
- [ ] GREEN: Extract a reusable web link-CTA primitive with solid top-bar and offset-border timeline variants, reuse at both existing links, and add a reusable brand-aligned non-interactive web Badge; leave native `Button`, text-link `LinkBtn`, and admin Badge unchanged. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: Run scoped web tests and inspect focus/contrast and narrow visual parity for both existing links and the Badge; do not import admin Badge or use hardcoded `NewBadget`. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: Share only navigation CTA visuals and retain existing web link semantics, labels, and layout without broad redesign. <!-- sdd-owner: implementation -->

**Verification commands:** `bun run test --filter=@frijolmagico/web`, `bun run type-check`, `bun run lint`.

## Work Unit 6 — Hydration-only registration affordance and ActivityItem placement

**Depends on:** Work Units 5 and 6A. **Expected boundary:** public client behavior and UI placement only.

**Expected files/discovery targets:**
- `apps/web/src/app/**/festivales/**/[slug]/components/ActivityItem.tsx`
- `apps/web/src/app/**/festivales/**/[slug]/components/activity-registration-affordance.tsx`
- `apps/web/src/components/link-cta.tsx` and `apps/web/src/components/badge.tsx` (reuse)
- adjacent ActivityItem/ActivityList/component tests

- [ ] RED: Add pure helper and component tests for hidden server/first render, inclusive start/end, inactive/malformed values, boundary timers, timeout re-evaluation, focus/visibility reconciliation, cleanup, collapsed `Inscríbete` Badge, expanded-only `Inscríbete Aquí` anchor CTA, music exclusion, exact labels, target/rel, no button nesting, readable contrast, and focus-visible semantics. <!-- sdd-owner: implementation -->
- [ ] GREEN: Implement client-only leaf affordances with `active=false` initialization, boundary scheduling without polling, lifecycle listeners, safe anchor attributes through the shared link-CTA, reusable non-interactive web Badge at top-right, and CTA at the bottom of expanded content. <!-- sdd-owner: implementation -->
- [ ] TRIANGULATE: Run web tests with fake clocks/timers and explicit focus/visibility events; verify server-rendered markup contains neither label and no CTA appears in summary/minimal cards. <!-- sdd-owner: implementation -->
- [ ] REFACTOR: Keep `ActivityItem` server-first, isolate timing logic from markup, and preserve existing card/details semantics and music rendering. <!-- sdd-owner: implementation -->

**Verification commands:** `bun run test --filter=@frijolmagico/web`, `bun run type-check`, `bun run lint`.

## Work Unit 7 — Cross-workspace regression and delivery gate

**Depends on:** Work Units 1–6 and 6A. **Expected boundary:** verification only; no new behavior.

- [ ] Run the complete strict-TDD evidence pass: database, admin, and web RED/GREEN/TRIANGULATE/REFACTOR results are recorded in the apply/verify artifacts, with failures resolved before delivery. <!-- sdd-owner: implementation -->
- [ ] Run `bun run test`, `bun run type-check`, and `bun run lint`; capture command results and changed-line statistics with `git diff --stat`. <!-- sdd-owner: implementation -->
- [ ] Verify scope boundaries: no catalog/artist changes, no rollback SQL file, no URL/window indexes, no polling/cron/TTL/worker infrastructure, and no unsafe secrets or destructive migration execution. <!-- sdd-owner: implementation -->

## Parent-owned lifecycle actions (future authorized steps; after apply only)

- [ ] Before any PR, create or verify a matching issue through the repository issue form/review process and confirm `status:approved`; creating an issue alone does not approve it. Do not publish remotely without authorization. <!-- sdd-owner: parent -->
- [ ] Measure additions + deletions per child PR against 400 changed lines and target about ≤60 minutes of review; make one honest cohesive slicing pass if needed, keeping tests/docs with behavior. If an unavoidable slice still exceeds 400, report its actual count/rationale and stop for maintainer `size:exception` approval; never infer approval or shrink code artificially. <!-- sdd-owner: parent -->
- [ ] When separately authorized, prepare a draft/no-merge tracker PR targeting `dev` (never `main`); child PR #1 targets the tracker branch, and each later child targets the immediately previous branch. Use `.github/PULL_REQUEST_TEMPLATE.md` for tracker and children, link the approved issue, and ensure exactly one `type:*` and one `major|minor|patch` version label per PR. Add chain context and a dependency diagram marking the current child `📍` without replacing the template. No direct commits to `dev`. <!-- sdd-owner: parent -->
- [ ] Verify each child PR diff contains only its current work unit with tests/docs and checks; integrate children in order, keep tracker draft/no-merge until integration, then rebase the final tracker branch onto current `dev` before final review/merge. Record actual branch/PR/label/rebase evidence only if performed. <!-- sdd-owner: parent -->
- [ ] Start or reuse a bounded review after the implementation diff and verification evidence are available, according to the user-owned review switch and provider route; no review begins during this planning edit. <!-- sdd-owner: parent -->
- [ ] Stop and request authorization before any destructive migration rollback/drop of `activity_registration`. <!-- sdd-owner: parent -->
