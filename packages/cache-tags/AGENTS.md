# Cache Tags — Single Source of Truth

All Next.js cache tags for the monorepo. Shared by web (`cacheTag()`) and admin (`updateTag()`).

## Exports

Import as `@frijolmagico/cache-tags`:

| Export | Type | Purpose |
|---|---|---|
| `CATALOG_CACHE_TAG` | constant | Artistas del catálogo |
| `FEATURED_ARTISTS_CACHE_TAG` | constant | Home destacados |
| `NOSOTROS_CACHE_TAG` | constant | Página nosotros |
| `FESTIVALES_CACHE_TAG` | constant | Festivales |
| `ARTIST_CACHE_TAG` | constant | Artistas |
| `ARTIST_HISTORY_CACHE_TAG` | constant | Historial de artista |
| `EVENT_CACHE_TAG` | constant | Eventos |
| `EDITION_CACHE_TAG` | constant | Ediciones |
| `EDITION_DAY_CACHE_TAG` | constant | Días de edición |
| `PLACE_CACHE_TAG` | constant | Lugares |
| `PARTICIPATIONS_CACHE_TAG` | constant | Participaciones |
| `EXHIBITION_CACHE_TAG` | constant | Exposiciones |
| `ACTIVITY_CACHE_TAG` | constant | Actividades |
| `ACTIVITY_DETAIL_CACHE_TAG` | constant | Detalle de actividad |
| `DISCIPLINES_CACHE_TAG` | constant | Disciplinas |
| `ACTIVITY_TYPES_CACHE_TAG` | constant | Tipos de actividad |
| `ADMISSION_MODES_CACHE_TAG` | constant | Modalidades de admisión |
| `COLLECTIVES_CACHE_TAG` | constant | Agrupaciones |
| `COLLECTIVE_CACHE_TAG` | constant | Agrupación individual |
| `COLLECTIVE_ACTIVE_CACHE_TAG` | constant | Agrupaciones activas |
| `COLLECTIVE_DELETED_CACHE_TAG` | constant | Agrupaciones eliminadas |
| `BAND_CACHE_TAG` | constant | Bandas |
| `BAND_ACTIVE_CACHE_TAG` | constant | Bandas activas |
| `BAND_DELETED_CACHE_TAG` | constant | Bandas eliminadas |
| `ORGANIZATION_CACHE_TAG` | constant | Organización |
| `TEAM_CACHE_TAG` | constant | Equipo |

Functions (parameterized tags):

- `getEditionParticipationsCacheTag(editionId)` — `participaciones:edicion:{id}`
- `getParticipationExhibitionsCacheTag(participationId)` — `exposiciones:participacion:{id}`
- `getParticipationActivitiesCacheTag(participationId)` — `actividades:participacion:{id}`
- `getCollectiveMembersCacheTag(collectiveId)` — `agrupacion:miembros:{id}`

## Naming

- **Constants:** `UPPER_SNAKE_CASE`. Domain prefix, then specific: `DOMAIN_SUBJECT_CACHE_TAG`.
- **Functions:** `camelCase`. Verb + domain + params: `getEditionParticipationsCacheTag`.
- **Tag values:** `dominio:subjetivo` (Spanish, lowercase, colon-separated).
