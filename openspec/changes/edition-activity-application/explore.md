# Exploration: Edition Activity Applications

## Scope correction

This feature is strictly about the domain chain **event edition -> edition participation -> activity -> activity type**. The catalog/artist surface is unrelated and OUT OF SCOPE. No catalog mapping, catalog query, artist-card change, or catalog CTA is recommended by this exploration.

The public target is the existing festival edition activity card rendered by `ActivityItem`, including native collapsed/expanded `<details>` content. Music activities remain excluded.

## Domain and schema evidence

- `packages/database/src/db/schema/events.ts` owns `evento_edicion` and edition days; edition identity is `evento_edicion.id`.
- `packages/database/src/db/schema/participations.ts` owns the chain:
  - `editionParticipation` -> `participacion_edicion.edicion_id` (edition membership).
  - `participationActivity` -> `participacion_actividad.participacion_id`, with required `tipo_actividad_id`.
  - `activityType` -> `tipo_actividad`, keyed by `id` and unique `slug`.
  - `activity` -> `actividad.participacion_actividad_id`, unique one-to-one detail row containing title, description, duration, location, start time, and capacity.
- Existing activity-type behavior is visible in `apps/admin/src/app/(core)/eventos/participaciones/_constants/participations.constants.ts` and `create-activity-dialog.tsx`: band participants are forced to `ACTIVITY_TYPES.MUSICA`. Public query branches by `ta.slug`; music is currently rendered by `MusicActivityItem`.
- There is no application URL or application period column in these activity tables today. The requested data belongs to an edition activity, not to the catalog or artist domain. Exact physical ownership remains a product/schema decision; the existing activity participation row is the type-bearing candidate, while `actividad` is the existing detail row.

## Admin create/update flow

- Form/schema: `apps/admin/src/app/(core)/eventos/participaciones/_schemas/activity.schema.ts` derives Drizzle-Zod schemas for `participationActivity` and `activity`, then combines them into `activityFormSchema` with entity and participant type fields.
- Create UI: `.../participaciones/_components/create-activity-dialog.tsx` submits `createActivityAction` with edition participation, activity, and detail payloads; it forces music for bands.
- Create action: `.../_actions/activities/create-activity.action.ts` authenticates, validates participation/activity/detail, inserts `participacion_edicion`, `participacion_actividad`, and `actividad` in one transaction, then updates edition and participation-activity cache tags.
- Update UI: `.../participaciones/_components/update-activity-dialog.tsx` uses `executeUpdatePlan` and currently updates participation, activity, and detail separately; its form defaults contain no application settings.
- Update actions: `.../_actions/activities/update-activity.action.ts` updates `participacion_actividad`; `update-activity-detail.action.ts` updates `actividad`; create counterpart is `create-activity-detail.action.ts`.
- Server validation must be authoritative: client hiding for music is insufficient. URL validation must reject invalid values, and at most one URL can exist per activity. Existing URL precedent is `z.url` in `apps/admin/src/shared/schemas/person.schema.ts`.

## Public query/data flow

- The in-scope query is `apps/web/src/app/(sections)/festivales/[slug]/adapters/queries/festivalDetailQuery.ts`, not any catalog query. Its `actividades` subquery joins `participacion_edicion`, `participacion_actividad`, `actividad`, and `tipo_actividad`, filters by `ped2.edicion_id`, and returns title, description, duration, location, start time, type slug, edition-day date, and participant display name.
- `apps/web/src/app/(sections)/festivales/[slug]/adapters/festivalDetailRepository.ts` executes that query; mapping/types are in `.../[slug]/adapters/mappers/festivalDetailMapper.ts` and `apps/web/src/app/(sections)/festivales/types/festival.ts` (`FestivalActivity`). The public DTO currently has no application fields.
- `apps/web/src/app/(sections)/festivales/[slug]/lib/getFestivalBySlug.ts` loads the detail and applies `cacheTag(FESTIVALES_CACHE_TAG)`, `EVENT_CACHE_TAG`, and `EDITION_CACHE_TAG`. Admin activity actions currently invalidate admin participation tags only; no demonstrated admin-to-public invalidation exists for this detail query.
- `apps/web/src/app/(sections)/festivales/[slug]/components/FestivalDetailContent.tsx` renders `ActivityList`; `ActivityList.tsx` groups activities by type and chooses `ActivityItem` versus `MusicActivityItem`.

## Existing public card hierarchy and placement

`FestivalDetailContent` -> `ActivityList` -> non-music `ActivityItem` / music `MusicActivityItem`.

`ActivityItem.tsx` renders an `article`. If details exist, the card uses native `<details className='group/details'>`: always-visible `summary` contains participant/title and chevron; expanded content is the following bordered `<div>`, containing time, location, description, and duration. If no details exist, it renders a non-collapsible card. Therefore:

- The `Inscríbete` badge belongs in the top-right of the non-music activity card and must be visible only while configured and active.
- The `Inscríbete Aquí` CTA belongs at the bottom of the expanded content only; it must not be rendered in `summary` or collapsed-only markup.
- Music activities use `MusicActivityItem` and must never expose application UI.
- A valid application link should be a semantic link with the required Spanish label and accessible focus state; external-target/analytics behavior is not established by current code.

## Date/time and type-specific evidence

- Existing public activity display combines `fecha` and `hora_inicio` as text (`ActivityItem.tsx`); edition-day dates and activity start times are stored as text in the schema/query. No application-window date/datetime convention or timezone policy exists in the inspected activity flow.
- Activity type is data-driven by `tipo_actividad.slug`; `MusicActivityItem` is selected when `tipo === 'musica'`. Admin additionally forces music for band participants on create. Eligibility therefore needs a server-side rule based on the activity type (and must account for the existing band normalization), not catalog membership.
- Required behavior from the feature facts: at most one URL; music never supports applications; admin configures URL and period; URL must be valid; badge and bottom CTA appear only when URL is configured and the current instant is inside the configured period; both are hidden before and after.

## Cache behavior

- Shared tag definitions are in `packages/cache-tags/src/index.ts`, including `ACTIVITY_CACHE_TAG`, `ACTIVITY_DETAIL_CACHE_TAG`, `ACTIVITY_TYPES_CACHE_TAG`, and `getParticipationActivitiesCacheTag(participationId)`.
- Admin activity actions currently call `updateTag(getEditionParticipationsCacheTag(...))` or `updateTag(getParticipationActivitiesCacheTag(...))`.
- Public edition detail uses the three broad tags above. A solution must ensure both admin edits and the passage of time can make public visibility accurate; current tags alone do not establish automatic invalidation exactly at period boundaries.

## Relevant tests

- Public card behavior: `apps/web/src/app/(sections)/festivales/[slug]/components/ActivityItem.test.tsx` covers collapsed/expanded native-details behavior and minimal cards. `ActivityList.test.tsx` covers grouping/type rendering.
- Public query/repository: `.../[slug]/adapters/queries/festivalDetailQuery.test.ts` asserts the activity query contract; `festivalDetailRepository.test.ts`, mapper tests, `getFestivalBySlug.test.ts`, and `FestivalDetailContent.test.tsx` cover data mapping and page composition.
- Public types: `apps/web/src/app/(sections)/festivales/types/festival.test.ts` covers `FestivalActivity` shape.
- Admin activity tests are under `apps/admin/tests/unit/app/(core)/eventos/participaciones`; additions should cover schema/action validation, create/update payloads, music rejection, URL validity, and cache updates. Follow repository commands: monorepo `bun run test`; app-specific tests may use the documented Bun commands.

## Genuinely unresolved product decisions

1. **Storage ownership:** add application fields to `participacion_actividad`, to the one-to-one `actividad` detail row, or create a dedicated activity-application table. The choice must preserve one application per edition activity and support type validation.
2. **Window representation:** date-only versus datetime, inclusive/exclusive end, equal start/end behavior, incomplete ranges, and authoritative timezone (festival local timezone versus UTC).
3. **Configuration invariant:** whether URL and period are all optional, whether URL requires both boundaries, and whether the admin blocks incomplete/invalid configurations or treats them as inactive.
4. **Music mutation policy:** whether changing an eligible activity to music clears existing application data or rejects the type change while data exists; server rejection is required either way.
5. **Public freshness:** how cached public pages become correct exactly at start/end without an admin edit (time-aware revalidation/TTL or another explicit strategy).
6. **Link contract:** same-tab versus new-tab, `rel` requirements, exact accessible naming beyond the specified labels, and analytics requirements.

No catalog/artist decision is unresolved because that surface is explicitly out of scope.
