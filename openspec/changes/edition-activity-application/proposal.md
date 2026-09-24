# Proposal: Edition Activity Registration

## Intent

Allow administrators to configure a time-bounded external registration link for eligible activities belonging to a festival edition, and expose that registration affordance on the public festival edition activity card only while the configured window is active.

This change is limited to the domain chain `edition -> edition participation -> participation activity -> activity type`. Catalog and artist experiences are unrelated and remain unchanged.

## Problem

Edition activities currently have no dedicated registration configuration. Administrators cannot attach an HTTPS registration destination and activation window to an eligible activity, and public visitors cannot discover or follow an active registration link from the festival edition activity card.

The current aggregate update path is also non-atomic: participation, activity type, and activity details are updated through separate operations. Registration lifecycle rules—especially clearing registration when an activity becomes music—cannot be made transactionally coherent without addressing that boundary.

## Proposed Outcome

Administrators can optionally configure one complete registration record for a non-music participation activity. They enter local Chilean date and time values, which the server resolves in `America/Santiago` and stores as canonical UTC instants. The server validates all eligibility and data invariants.

On the public festival edition page, a configured non-music `ActivityItem` initially renders without registration UI. After hydration, client-side time evaluation displays an `Inscríbete` badge and, when expanded content exists, an `Inscríbete Aquí` CTA while the current instant falls within the inclusive registration window. Boundary timers and focus/visibility reconciliation keep an already-open page reasonably current without polling or scheduling infrastructure.

## Scope

### Database and domain model

- Add an optional dedicated one-to-one table named `activity_registration`.
- Link it to `participacion_actividad` through required, unique `participation_activity_id` with `ON DELETE CASCADE`.
- Add these columns:
  - `id`
  - `participation_activity_id`
  - `url`
  - `start_at`
  - `end_at`
  - `created_at`
  - `updated_at`
- Treat row absence as no registration configuration.
- Require `url`, `start_at`, and `end_at` whenever a row exists.
- Require an HTTPS URL.
- Require `end_at` to be strictly later than `start_at`.
- Use the unique constraint on `participation_activity_id` as the join and lookup index. Do not add indexes for `url`, `start_at`, or `end_at` without a demonstrated query requirement.
- Add migration-level checks and/or triggers where appropriate for defense in depth, including invariants that can be enforced reliably in the existing database.
- Extend Drizzle schema, relations, inferred types, and migration artifacts.

### Admin configuration

- Extend activity schemas, create/update actions, form payloads, and activity dialogs to support an optional registration configuration.
- Hide registration inputs when the selected activity type is music.
- Treat client-side hiding as presentation only; server actions remain authoritative.
- Accept date and time as Chile-local admin input in `America/Santiago` and resolve them to canonical UTC ISO instants before persistence.
- Account for Chilean timezone offset and daylight-saving behavior through timezone-aware conversion rather than a fixed offset.
- Reject partial registration configuration, non-HTTPS URLs, invalid local date/time input, ambiguous or nonexistent local instants that cannot be safely resolved, equal boundaries, and reversed windows.
- Create, update, or delete the optional registration row according to the submitted complete configuration.
- Reject registration configuration for music activities.
- When an eligible activity changes to music, atomically delete any existing registration row as part of the same aggregate mutation.
- Refactor or introduce an aggregate transaction boundary so participation-activity changes, activity detail changes, registration writes/deletes, and the change-to-music cleanup succeed or fail together where they belong to one save operation.
- Integrate registration mutations with the existing save-time cache invalidation mechanism, including the public festival edition detail tags needed for saved changes to become visible.

### Public data flow

- Extend the festival edition detail SQL query to left join `activity_registration` through `participacion_actividad`.
- Carry registration URL and canonical start/end instants through repository mapping, DTOs, and public festival activity types.
- Do not filter registration rows by current time in SQL or require a browser-to-database request.
- It is acceptable for serialized public data to contain the registration URL outside the active window.
- Keep music activities on `MusicActivityItem`; they must not render registration UI.

### Public activity UI

- Implement registration behavior only in the festival edition `ActivityItem` path.
- Render no registration badge or CTA in the initial server output.
- After hydration, evaluate an active window as `now >= start_at && now <= end_at`.
- While active, display an `Inscríbete` badge at the top-right of the activity card, including while the native details element is collapsed.
- While active and the card's expanded-content region is rendered, place an `Inscríbete Aquí` link at the bottom of that expanded content. Do not place the CTA in the summary or collapsed-only markup.
- Open the HTTPS destination in a new tab and apply safe `rel` attributes.
- Schedule local timers for the next start or end boundary and recompute state after window focus and document visibility changes.
- Do not poll.
- Accept the small post-hydration delay or flicker created by the intentionally hidden initial state.

### Tests

Add or update tests covering:

- Migration/schema shape, one-to-one uniqueness, cascade behavior, required values, boundary ordering, and applicable database defenses.
- Chile-local input conversion to UTC, including daylight-saving edge cases.
- Admin schema validation for complete/absent configurations, HTTPS-only URLs, invalid windows, and music exclusion.
- Transactional create, update, delete, and eligible-to-music cleanup behavior, including rollback on aggregate failure.
- Existing and public cache-tag invalidation after registration-related saves.
- Public SQL join and repository/mapper/DTO propagation.
- Initial hidden state, inclusive start/end behavior, inactive states, boundary timers, focus/visibility recomputation, collapsed badge placement, expanded CTA placement, safe external-link attributes, and music exclusion.
- Regression coverage for activity cards without registration configuration.

## Business Rules and Invariants

1. A participation activity has zero or one registration row.
2. A registration row is complete: URL, start instant, and end instant are all present.
3. Registration URLs use HTTPS only.
4. Registration windows use canonical UTC instants in storage, derived from admin-entered `America/Santiago` local date and time.
5. The active interval includes both boundaries, while persisted `end_at` must still be strictly later than `start_at`.
6. Music activities cannot have registration configuration.
7. Changing an eligible activity to music deletes its registration atomically.
8. Server and database controls enforce invariants independently of admin UI visibility.
9. The public registration affordance is progressive client behavior and is hidden before hydration.
10. Public timing does not depend on cache expiration, background jobs, polling, or a direct browser database request.

## Affected Areas

- `packages/database`: SQL migration, Drizzle schema, relations, and types for `activity_registration`.
- `apps/admin`: activity validation schemas, create/update aggregate actions, activity forms/dialogs, transaction handling, and cache invalidation calls.
- `apps/web`: festival detail SQL, repository, mapper, DTO/type definitions, `ActivityItem`, and client-side registration-window behavior.
- `packages/cache-tags` or existing tag consumers only if the current public invalidation tags cannot be reused without introducing a new constant or helper.
- Unit/integration tests adjacent to database, admin activity, festival query/mapping, and activity card behavior.

## Non-Goals

- Catalog or artist data, queries, cards, or CTAs.
- Changes to `MusicActivityItem` beyond regression protection that confirms registration remains absent.
- Analytics or click tracking.
- Remote URL reachability checks.
- A generalized activity-card redesign.
- Realtime propagation of an admin edit to browser tabs that are already open.
- Time-based cache invalidation, cron jobs, queues, TTL policies, workers, or other scheduling infrastructure.
- New indexes on registration URL or window columns without a future query requirement.

## Risks and Mitigations

### Aggregate update atomicity

**Risk:** The existing update flow performs related mutations separately, so type, details, and registration state could diverge after a partial failure.

**Mitigation:** Establish a server-side aggregate transaction for coherent save operations. Make eligible-to-music cleanup part of the same transaction as the type change. Add rollback tests that exercise failures between mutations.

### Timezone and daylight-saving conversion

**Risk:** Treating Chilean input as a fixed UTC offset could store the wrong instant, while daylight-saving transitions can create ambiguous or nonexistent local times.

**Mitigation:** Use an `America/Santiago` timezone-aware conversion path, validate conversion results server-side, define unsafe transition inputs as validation errors, and test representative DST boundaries.

### Client clock and hydration timing

**Risk:** Public visibility depends on the visitor's browser clock and begins only after hydration, creating a small delay and allowing inaccurate client clocks to affect display.

**Mitigation:** This tradeoff is explicitly accepted for the initial slice. Keep server output hidden, use canonical timestamps, recompute at boundaries and lifecycle events, and avoid more complex scheduling infrastructure.

### Cached serialized configuration

**Risk:** Already-open tabs do not receive later admin edits, and cached page data changes only after save-time invalidation.

**Mitigation:** Reuse the existing invalidation mechanism for saves and invalidate the public festival detail tags. Explicitly retain realtime propagation as a non-goal. Local timers handle passage through boundaries for the configuration already loaded by a tab.

### Defense-in-depth limits

**Risk:** Cross-table eligibility checks for music may not be expressible as a simple check constraint and can drift if enforced only in application code.

**Mitigation:** Keep authoritative validation in transactional server actions and use a database trigger where compatible with the database and migration conventions. Document any invariant that cannot be enforced directly in the database and cover it with integration tests.

### Review size

**Risk:** Database, admin, public data, UI, and tests span multiple workspaces and are likely to exceed the 400-line review budget.

**Mitigation:** Before implementation, estimate the concrete diff and pause under the selected `ask-on-risk` strategy if the budget is at risk. Do not infer a chain strategy or a size exception without user approval.

## Rollback

- Revert admin and public consumers first so no code reads or writes registration records.
- Revert the additive `activity_registration` migration according to repository migration policy. Dropping the table destroys registration configuration and therefore requires explicit destructive-operation approval.
- Existing participation activities remain valid because the relationship is optional and isolated in a dedicated table.
- If a staged rollout is required, the additive table can remain unused while application changes are reverted; this is the preferred non-destructive rollback.
- Existing activity and music rendering behavior should resume without data migration because their current columns are unchanged.

## Success Criteria

- An admin can save no registration or one complete registration for an eligible edition participation activity.
- Valid Chile-local input is stored as the correct UTC instants, including across relevant daylight-saving offsets.
- Invalid, partial, non-HTTPS, equal-boundary, reversed, or music registration configurations are rejected server-side.
- Changing an eligible activity to music atomically removes its registration configuration.
- Aggregate activity saves do not leave partial registration/type/detail state after a failure.
- Public festival edition data includes the optional registration fields for non-music activity cards without adding browser-to-database traffic.
- Before hydration and outside the inclusive window, neither badge nor CTA is rendered.
- During the inclusive window, `ActivityItem` shows the collapsed-visible `Inscríbete` badge and the expanded-content `Inscríbete Aquí` link with safe new-tab behavior.
- The UI transitions at start/end boundaries and reconciles after focus/visibility changes without polling.
- Music activities and catalog/artist surfaces remain unchanged.
- Save-time invalidation makes later public requests observe admin registration edits, without introducing time-based infrastructure.
- Automated tests cover database invariants, admin mutations, public data propagation, timing behavior, accessibility-relevant link behavior, and regressions.

## Delivery Note

This proposal intentionally does not select a chained delivery strategy. The feature crosses database, admin, and web boundaries and is likely to trigger the 400-line review-budget gate. Under `ask-on-risk`, implementation planning must quantify that risk and request a delivery decision before producing an oversized diff.
