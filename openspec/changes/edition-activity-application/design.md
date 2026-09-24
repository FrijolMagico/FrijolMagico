# Technical Design: Edition Activity Registration

## 1. Design goals

This design adds optional, time-bounded external registration to the existing domain chain:

`event edition -> edition participation -> participation activity -> activity type`

The implementation must preserve these approved contracts:

- The table is exactly `activity_registration`.
- Its columns are exactly `id`, `participation_activity_id`, `url`, `start_at`, `end_at`, `created_at`, and `updated_at`.
- A registration exists only for a non-music `participacion_actividad`.
- The unique foreign key on `participation_activity_id` is the lookup and join index; no indexes are added for `url`, `start_at`, or `end_at`.
- Admin-entered local values are interpreted in `America/Santiago`; persisted boundaries are canonical UTC instants.
- Public time transitions use only serialized server data and local browser JavaScript.
- Registration UI is absent from the initial server output; the accepted small hydration delay remains.
- No cron, queue, polling, TTL, worker, time-based cache invalidation, or scheduling infrastructure is introduced.

Catalog and artist surfaces remain outside this design.

## 2. Architecture overview

The feature uses four boundaries:

1. **Database boundary:** `activity_registration` owns the optional one-to-one configuration and enforces locally expressible invariants.
2. **Admin aggregate boundary:** one authenticated action validates and commits all data belonging to an activity save in one transaction.
3. **Public read boundary:** the festival detail query serializes registration configuration without applying a current-time filter.
4. **Client visibility boundary:** small client-only leaf components derive visibility from the serialized UTC boundaries and reconcile timers and browser lifecycle events.

End-to-end create/update flow:

`Admin local form values -> Zod complete-or-absent validation -> America/Santiago conversion -> authoritative type/ownership lookup -> one Drizzle transaction -> post-commit cache invalidation`

End-to-end public flow:

`activity_registration LEFT JOIN -> JSON registration DTO -> FestivalActivity -> server-rendered ActivityItem with hidden client leaves -> hydration-time evaluation -> boundary/lifecycle reconciliation`

## 3. Database design

### 3.1 Table and storage representation

Add `activityRegistration` to `packages/database/src/db/schema/participations.ts`, mapped to `activity_registration`.

| SQL column | Drizzle property | Type and constraints |
|---|---|---|
| `id` | `id` | Integer primary key, auto-increment |
| `participation_activity_id` | `participationActivityId` | Integer, required, unique, FK to `participacion_actividad.id`, `ON DELETE CASCADE` |
| `url` | `url` | Text, required |
| `start_at` | `startAt` | Text, required, canonical UTC ISO instant |
| `end_at` | `endAt` | Text, required, canonical UTC ISO instant |
| `created_at` | `createdAt` | Text, required, default `CURRENT_TIMESTAMP` |
| `updated_at` | `updatedAt` | Text, required, default `CURRENT_TIMESTAMP` |

`start_at` and `end_at` use a fixed millisecond UTC representation such as `2026-09-05T16:30:00.000Z`. Fixing the representation makes values unambiguous across Drizzle, raw SQL JSON, JavaScript parsing, and lexical ordering.

The unique constraint on `participation_activity_id` creates SQLite's unique backing index. No separate `idx_activity_registration_participation_activity` is created because it would duplicate that access path.

### 3.2 Migration constraints and triggers

Create only the forward migration `packages/database/migrations/0021_activity_registration.sql` and update `packages/database/migrations/meta/_journal.json` through the repository's Drizzle migration workflow. The migration is additive and requires no backfill because row absence means no registration configuration. No rollback SQL file will be created.

The table includes database checks for:

- URL text starts with `https://` and contains at least one character after the scheme. Full URL parsing remains a server responsibility because SQLite cannot reliably duplicate WHATWG URL semantics.
- `start_at` and `end_at` parse and round-trip through SQLite to the selected canonical UTC millisecond format.
- `end_at` is strictly later than `start_at`. Because both values are fixed-format UTC strings, lexical comparison is valid; migration tests also verify the equivalent instant ordering.

Add these triggers:

- `trg_activity_registration_updated_at`: after an update that did not explicitly change `updated_at`, set it to `CURRENT_TIMESTAMP` using the repository's guarded non-recursive pattern.
- `trg_activity_registration_reject_music_insert`: reject an insert when the referenced activity type slug is `musica`.
- `trg_activity_registration_reject_music_update`: reject an update that points to an activity whose type slug is `musica`.
- `trg_participation_activity_clear_registration_on_music`: after `participacion_actividad.tipo_actividad_id` changes to a type whose slug is `musica`, delete the related registration row.
- `trg_activity_type_clear_registration_on_music_slug`: if an activity-type catalog row itself is changed to slug `musica`, delete registrations belonging to that type.

The server remains authoritative even with these triggers. The triggers defend writes from other clients and ensure that direct type changes cannot leave a music registration behind.

### 3.3 Drizzle relations and inferred types

Extend `packages/database/src/db/relations.ts` as follows:

- `participationActivityRelations` gains a singular `registration` relation from `participationActivity.id` to `activityRegistration.participationActivityId`.
- A new `activityRegistrationRelations` declaration exposes the reverse singular `participationActivity` relation.

Extend `packages/database/src/db/types.ts` with:

- `ActivityRegistration = InferSelectModel<typeof activityRegistration>`
- `NewActivityRegistration = InferInsertModel<typeof activityRegistration>`

The existing `participations` namespace export automatically exposes the table after it is declared in `participations.ts`; no new barrel file is introduced.

## 4. Admin validation and timezone conversion

### 4.1 Form contract

Extend `activityFormSchema` with a nested registration form value containing:

- `url`
- `startDate`
- `startTime`
- `endDate`
- `endTime`

All five form values are strings because they bind directly to URL, date, and time controls. The enclosing `activityFormSchema` trims whitespace-only values to empty strings and validates two states while retaining the five-string object (or `undefined` when omitted) in its output to preserve the existing React Hook Form input type:

- all five fields empty; or
- all five fields present and valid.

Any partial state is rejected with Spanish field/form errors. The URL must parse with WHATWG URL semantics and have protocol exactly `https:`. No remote reachability request is made.

**Normalization boundary:** `parseActivityRegistrationInput` is the separate normalized action-input parser. It maps an all-empty form object, `undefined`, or `null` to `null`, preserves a valid complete object, and rejects partial, invalid, or music registration. The enclosing form does **not** itself output `registration: null`. Work Unit 3 must call the parser on submitted registration data before writing; Work Unit 2 provides and tests this boundary but does not wire actions or dialogs. The action input must use the normalized complete-or-null result, never accept canonical instants directly from the browser, and cannot bypass Chile-local interpretation.

### 4.2 Timezone utility

Add `@js-temporal/polyfill` as a direct admin dependency while complete native Temporal support is unavailable, and keep conversion in a server-only utility under the participation feature. This is preferred over a fixed offset or host-local `Date` construction because Chilean offsets vary and DST transitions require explicit disambiguation.

For each submitted boundary, the utility:

1. Strictly parses the date and time components rather than allowing JavaScript date rollover.
2. constructs a `Temporal.ZonedDateTime` with `timeZone: 'America/Santiago'` and `disambiguation: 'reject'`;
3. rejects nonexistent and ambiguous local instants;
4. converts the result to `Temporal.Instant`;
5. serializes with millisecond precision and a trailing `Z`.

The utility then requires `endInstant > startInstant`. Equality is rejected even though public visibility includes both persisted boundaries.

The inverse utility converts stored UTC instants back to `America/Santiago` date and time strings for update-form defaults. Conversion occurs in the server DAL, so defaults do not depend on the administrator browser's timezone.

### 4.3 Authoritative eligibility

Client hiding is presentation only. Inside the transaction, the action resolves the effective activity type by database slug:

- Band participation is normalized server-side to the database type whose slug is `musica`, preserving the existing band rule without trusting the submitted numeric type ID.
- Other entities use the submitted type ID, which must resolve to an existing activity type.
- A complete submitted registration combined with effective slug `musica` is rejected.
- An absent registration combined with a transition to `musica` is valid and deletes any existing row.

Database identity is checked before mutation: the participation activity must belong to the submitted edition participation, and that participation must belong to the submitted edition. Detail and registration row IDs are not accepted from the client; ownership is derived through `participation_activity_id`.

## 5. Admin aggregate transaction strategy

### 5.1 Create

Extend `createActivityAction` to accept the normalized registration value. It keeps a single `db.transaction` and performs:

1. find or create the edition participation;
2. resolve the authoritative effective activity type;
3. validate music eligibility;
4. insert `participacion_actividad`;
5. insert the `actividad` detail row;
6. insert `activity_registration` only when registration is complete.

Conversion and shape validation occur before writes where possible; authoritative relationship and type checks occur inside the transaction. Any thrown validation or persistence error rolls back all inserts.

### 5.2 Update

Replace the update dialog's `executeUpdatePlan` sequence with one `updateActivityAggregateAction`. Its payload includes the edition identity, edition-participation values, participation-activity values, detail values, and normalized registration value.

After ownership and eligibility checks, one transaction performs:

1. update the verified `participacion_edicion` entity fields when changed;
2. update `participacion_actividad`, including the effective type;
3. upsert `actividad` by its unique `participacion_actividad_id` so a missing detail row can be created without trusting a detail ID;
4. apply registration intent:
   - complete plus non-music: upsert by unique `participation_activity_id` and update URL/boundaries;
   - absent plus non-music: delete any row;
   - absent plus music: delete any row in the same transaction;
   - complete plus music: reject and roll back.

The explicit music delete remains in application logic even though the database trigger supplies defense in depth. This makes domain intent testable and keeps behavior independent of trigger side effects.

The old separate update actions are removed from this dialog path. They must not remain callable as an alternate non-atomic save path for the same form. If another caller still exists at implementation time, it must either migrate to the aggregate action or be narrowed to a truly independent operation.

### 5.3 Admin read and form data flow

Extend `getActivitiesWithDetails` to left join `activity_registration`, select its canonical values, and return an optional registration form-default object after server-side UTC-to-Chile conversion. Extend `ActivityWithDetail`, `ActivityLookup`, and participation composition accordingly.

Create dialog defaults use five empty registration strings. Update dialog defaults use the DAL-provided Chile-local strings or empty strings when no row exists.

When the selected/effective type becomes music, the dialog:

- hides the registration field group;
- clears all registration form values to the absent state;
- revalidates the form.

This gives the aggregate action the approved clear-on-music intent. A forged complete payload is still rejected server-side.

After a successful action, the dialog resets from submitted values, closes, and refreshes the route so cache-backed admin data reflects canonical values.

## 6. Cache invalidation

Cache invalidation occurs only after transaction commit. A rollback performs no invalidation.

For admin reads, create and update invalidate:

- `getEditionParticipationsCacheTag(editionId)`
- `getParticipationActivitiesCacheTag(participationId)`

For the public festival detail, the action uses the existing cross-app invalidation helper for every tag attached by `getFestivalBySlug`:

- `FESTIVALES_CACHE_TAG`
- `EVENT_CACHE_TAG`
- `EDITION_CACHE_TAG`

The same broad tag values may also be passed to local `updateTag`, but cross-app invalidation must go through the authenticated web revalidation endpoint because admin and web can be separate deployments. Invalidation failures are logged as post-commit operational failures and must not claim that the already-committed transaction rolled back. Tests verify that all required invalidation attempts occur only after a successful commit.

No registration-specific cache tag is needed for this slice. Time passage never invalidates a cache: cached responses already contain the boundaries, and hydrated clients evaluate them locally.

## 7. Public SQL and DTO propagation

### 7.1 Query

In `festivalDetailQuery.ts`, add:

- a `LEFT JOIN activity_registration ar ON ar.participation_activity_id = pact.id`;
- a JSON property named `registration` for each activity;
- `NULL` when `ar.id` is absent;
- otherwise an object containing exactly `url`, `start_at`, and `end_at`.

The query does not compare boundaries with current time and does not suppress inactive registration rows. This keeps the cached DTO time-independent and permits local transitions without a request.

### 7.2 Types and mapping

Add an `ActivityRegistration` public interface with required `url`, `start_at`, and `end_at` strings. Extend `FestivalActivity` with `registration: ActivityRegistration | null`.

Update repository fixtures/mocks and mapper tests to carry the field unchanged. The mapper performs no active-window calculation. Missing SQL rows map to `null`, never to a partially populated object.

`ActivityList` continues to route `tipo === 'musica'` to `MusicActivityItem`. Registration is ignored on that branch even if malformed legacy data appears, providing a final presentation-level guard.

## 8. Client-only visibility and lifecycle

### 8.1 Component boundary

Keep `ActivityItem` server-first. Add a small client-only registration affordance component/hook used in two leaf placements:

- badge variant at the article's top-right;
- CTA variant at the bottom of the existing expanded-content `<div>`.

Each leaf initializes `active` to `false`. Its server render and first hydration render therefore return `null`, guaranteeing that neither label appears in initial HTML. The effect computes visibility only after hydration. Using leaf clients avoids converting the whole activity card or native `<details>` structure into a client component.

The two leaves intentionally evaluate the same immutable registration input independently. This small duplication preserves correct DOM placement and avoids lifting the entire card into a client boundary.

The badge is rendered for active registrations even when `<details>` is collapsed or when the card has no expanded-content region. The CTA leaf is instantiated only inside the expanded-content region, so minimal cards have no CTA and the link is never placed in `<summary>`.

### 8.2 Active-state algorithm

A pure helper parses the canonical strings and returns active only when all data is valid and:

`now >= start_at && now <= end_at`

Invalid or missing data fails closed as inactive.

After every computation, the hook schedules at most one timeout:

- before start: next wake-up is `start_at`;
- from start through end: next wake-up is immediately after `end_at`, preserving visibility at the inclusive end instant;
- after end: no timeout.

The timeout callback recomputes from the current clock rather than assuming it fired exactly on time. Delays larger than the browser timeout maximum are safely chunked and re-armed toward the same boundary; this is boundary scheduling, not interval polling.

The hook also recomputes on:

- `window` focus;
- document `visibilitychange`.

This repairs state after background throttling, sleep, or suspended tabs. Cleanup removes both listeners and clears the outstanding timeout on unmount or input change.

No fetch, Server Action, route request, database request, interval, or polling loop is used.

### 8.3 Web CTA and badge treatment

The web `Button` in `apps/web/src/components/ui/button.tsx` renders a native button only (no `asChild`); it must not wrap an anchor or be used for navigation. `LinkBtn` is a text-link treatment, the top-bar CTA is a styled Next `Link` in `TopBarInfoClient.tsx`, and `FestivalTimelineCard` uses a separate offset-border Next `Link`. The admin Badge is app-local; `NewBadget` hardcodes `Nuevo!`. None is a reusable registration badge.

Extract a narrow, reusable web `LinkCta` anchor primitive with visual variants from the existing top-bar solid CTA and timeline offset-border CTA; migrate those two call sites to the matching variants without redesigning their placement or labels. Reuse the offset-border variant for registration, with the same visual button treatment on the anchor itself, never nested inside a button. Leave `LinkBtn` for text links and `Button` for actions. Each variant must provide a clearly visible `focus-visible` indicator and readable foreground/background contrast in default, hover, and focus states; verify these in component tests and visual review.

While active, the registration CTA is a semantic anchor with:

- exact visible and accessible text `Inscríbete Aquí`;
- `href` set to the server-validated HTTPS URL;
- `target="_blank"`;
- `rel="noopener noreferrer"`;
- the shared web link-CTA focus-visible treatment.

Add a small reusable web `Badge` primitive, styled with the existing web rounded/outlined brand language rather than importing admin Badge or reusing the hardcoded `NewBadget`. Render it as non-interactive text (`span`, no role/button/tab stop); pass the exact registration label `Inscríbete` as content. It is not a substitute for the CTA when expanded content exists.

## 9. Error and consistency behavior

- Validation errors return the existing `ActionState` failure shape with Spanish messages and no writes.
- Unknown IDs, relationship mismatches, and missing activity types are treated as validation/domain failures, not silent no-ops.
- Unique conflicts on `participation_activity_id` are handled through upsert, not a read-then-insert race.
- Database trigger/constraint failures are translated to a generic safe admin error unless a known invariant can be mapped to a specific Spanish message.
- Cache invalidation is post-commit and cannot affect transaction atomicity.
- Public invalid timestamps fail closed and produce no registration UI.
- Existing open public tabs retain their loaded configuration after later admin edits; realtime propagation remains a non-goal.

## 10. Planned file changes

### Database

- `packages/database/src/db/schema/participations.ts` — table and checks.
- `packages/database/src/db/relations.ts` — one-to-one relations.
- `packages/database/src/db/types.ts` — inferred select/insert types.
- `packages/database/migrations/0021_activity_registration.sql` — additive table, constraints, and triggers.
- `packages/database/migrations/meta/_journal.json` and generated metadata as required by Drizzle.
- `packages/database/tests/activity-registration.test.ts` — migration-level integration coverage.

### Admin

- `apps/admin/package.json` and lockfile — direct Temporal polyfill dependency.
- `.../participaciones/_schemas/activity.schema.ts` — complete-or-absent registration contract.
- `.../participaciones/_lib/activity-registration-time.ts` — strict Chile-local conversion and inverse defaults.
- `.../participaciones/_actions/activities/create-activity.action.ts` — transactional create extension.
- `.../participaciones/_actions/activities/update-activity-aggregate.action.ts` — authoritative atomic update.
- Existing separate update action files — remove from the dialog path and delete if unreferenced.
- `.../participaciones/_lib/data-access-layer/get-activities-with-details.ts` — registration join/default mapping.
- `.../participaciones/_types/activity.types.ts` and `participations.types.ts` — optional registration form data.
- `.../participaciones/_lib/participation-composer.ts` — propagate registration to selected activity data.
- `.../participaciones/_components/create-activity-dialog.tsx` and `update-activity-dialog.tsx` — fields, visibility, defaults, and aggregate submission.
- Adjacent admin unit/contract tests under `apps/admin/tests/unit/app/(core)/eventos/participaciones/`.

### Web

- `.../[slug]/adapters/queries/festivalDetailQuery.ts` — left join and nested registration JSON.
- `.../festivales/types/festival.ts` — public registration DTO.
- `.../[slug]/adapters/mappers/festivalDetailMapper.ts`, mocks, and repository tests — propagation/regression updates.
- `.../[slug]/components/ActivityItem.tsx` — two leaf placements.
- `apps/web/src/components/link-cta.tsx` — reusable semantic-link CTA variants and focus-visible/contrast treatment.
- `apps/web/src/components/badge.tsx` — reusable non-interactive web Badge.
- `apps/web/src/components/top-bar-info/TopBarInfoClient.tsx` and `.../festivales/components/FestivalTimelineCard.tsx` — reuse matching CTA variants without changing labels or placement.
- `.../[slug]/components/activity-registration-affordance.tsx` — client-only lifecycle behavior using the web CTA/Badge primitives.
- Adjacent query, mapper, repository, DTO, activity-item, activity-list, link-CTA, and Badge tests.

`packages/cache-tags` requires no new constant because the public detail already declares sufficient broad tags.

## 11. Test strategy

Use repository commands (`bun run test`, with workspace filters where appropriate); do not bypass Turbo with root `bun test`.

### Database integration

Verify:

- exact table and column names;
- required values;
- one row per participation activity;
- cascade deletion;
- no explicit URL/start/end indexes;
- HTTPS database check;
- canonical instant checks;
- strict boundary ordering;
- music insert/update rejection;
- cleanup when a parent changes to music;
- `updated_at` behavior.

### Admin schema and timezone unit tests

Verify:

- all-empty input becomes absent;
- complete input succeeds;
- every partial combination fails;
- HTTP and malformed URLs fail;
- equal/reversed windows fail;
- representative Chile standard and daylight-saving dates convert to expected UTC instants;
- ambiguous and nonexistent transition times fail;
- stored UTC values round-trip to Chile-local form defaults.

### Aggregate action tests

Verify:

- create with and without registration;
- update creates, updates, and deletes registration;
- eligible-to-music update deletes registration;
- forged music registration is rejected;
- band normalization is enforced server-side;
- detail upsert handles an absent detail row;
- ownership mismatch is rejected;
- injected failures after each mutation roll back participation, activity, detail, and registration state;
- cache invalidation is absent on rollback and complete after commit.

### Public data tests

Verify:

- SQL contains the exact left join and does not contain a current-time predicate;
- configured values propagate through repository, mapper, DTO, and composition;
- absent registration remains `null`;
- mocks and cards without registration remain valid;
- music remains on `MusicActivityItem` and renders no registration UI.

### Client lifecycle tests

Separate pure time calculation from React lifecycle wiring. Use fake clocks/timers and explicit event dispatch to verify:

- server-rendered HTML contains neither approved label;
- first hydrated effect reveals an active registration;
- exact start and exact end are active;
- before-start and after-end are inactive;
- start timer reveals and post-end timer hides;
- early/throttled callbacks recompute safely;
- focus and visibility changes reconcile state;
- cleanup removes listeners and timers;
- collapsed cards retain the badge;
- CTA is at the bottom of expanded content and absent from summary/minimal cards;
- link label, target, rel, semantic anchor (no nested button), and keyboard focus semantics;
- reusable CTA variants preserve top-bar/timeline labels and placement with visible focus and readable contrast;
- reusable Badge has non-interactive semantics, exact registration label, and readable contrast;
- malformed timestamps fail closed.

## 12. Rollout and rollback

1. Deploy the additive migration first or in the same release before code that writes the table.
2. Deploy admin and web consumers after the table exists.
3. Smoke-test one inactive, one active, one future, and one music activity, including a Chile DST-sensitive date in a non-production environment.
4. Monitor aggregate action errors, trigger violations, and cross-app invalidation failures.

The preferred operational rollback is non-destructive: revert admin and web consumers while leaving the unused additive table in place. No rollback SQL file is planned. Dropping `activity_registration` destroys saved configuration and requires explicit destructive-operation approval.

## 13. Explicit non-goals

This design does not include:

- catalog or artist data, queries, cards, or CTAs;
- changes to `MusicActivityItem` beyond regression protection;
- analytics or click tracking;
- remote URL reachability checks;
- a generalized activity-card redesign;
- realtime propagation of admin edits to already-open tabs;
- time-based cache invalidation, cron jobs, queues, TTL policies, workers, polling, or scheduling infrastructure;
- indexes on `url`, `start_at`, or `end_at`.

## 14. Delivery strategy and review budget

The approved strategy is `feature-branch-chain`: a draft/no-merge tracker branch and final tracker PR target `dev`, never `main`. Child PR #1 targets the tracker branch; each subsequent child PR targets the immediately preceding child branch. Integrate children in dependency order, keep each diff limited to its own work unit, and rebase the final tracker branch onto current `dev` before final review/merge. No direct commits to `dev`.

Before any PR, create or verify a matching issue using the repository issue form/review process and verify its `status:approved` label; creation alone does not grant approval. The tracker and every child PR use `.github/PULL_REQUEST_TEMPLATE.md`, link the approved issue, and have exactly one `type:*` and one `major|minor|patch` version label. Child bodies additionally state chain context, dependency diagram with the current PR marked `📍`, start/end, scope, follow-up, and review budget. The tracker stays draft/no-merge until the child chain is integrated.

Forecast 900–1,300 changed lines; plan database, admin, and web slices with tests/docs alongside the behavior. Check additions + deletions per child PR against 400 changed lines and aim for a focused review of at most about 60 minutes. Make one honest cohesive slicing pass if a slice exceeds 400; never remove tests/docs or compress code to fit. If it cannot split cleanly, stop and seek maintainer approval for `size:exception`, reporting the actual line count and rationale; this is not pre-approved. Branch publication, issue/PR creation, labels, rebase, and review are future authorized steps, not actions performed during planning. Stop for explicit user authorization before apply.
