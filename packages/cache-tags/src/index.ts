// ──────────────────────────────────────────────
// Cache Tags — single source of truth
// ──────────────────────────────────────────────
// All cache tags for the entire monorepo live here.
// Tags are domain-based (not app-prefixed) so the same value is used
// for cacheTag() / unstable_cache() on the web side and
// updateTag() / revalidateWebCache(tag:) on the admin side.
// ──────────────────────────────────────────────

// ── Catálogo ──────────────────────────────────
export const CATALOG_CACHE_TAG = 'catalogo:artistas'

// ── Home / Destacados ─────────────────────────
export const FEATURED_ARTISTS_CACHE_TAG = 'home:destacados'

// ── Páginas estáticas ─────────────────────────
export const NOSOTROS_CACHE_TAG = 'nosotros'
export const FESTIVALES_CACHE_TAG = 'festivales'

// ── Artistas ──────────────────────────────────
export const ARTIST_CACHE_TAG = 'artistas'
export const ARTIST_HISTORY_CACHE_TAG = 'artistas:historial'

// ── Eventos ───────────────────────────────────
export const EVENT_CACHE_TAG = 'eventos'

// ── Ediciones ─────────────────────────────────
export const EDITION_CACHE_TAG = 'ediciones'
export const EDITION_DAY_CACHE_TAG = 'ediciones:dias'
export const PLACE_CACHE_TAG = 'ediciones:lugares'

// ── Participaciones ───────────────────────────
export const PARTICIPATIONS_CACHE_TAG = 'participaciones'
export const EXHIBITION_CACHE_TAG = 'exposiciones'
export const ACTIVITY_CACHE_TAG = 'actividades'
export const ACTIVITY_DETAIL_CACHE_TAG = 'actividades:detalle'
export const DISCIPLINES_CACHE_TAG = 'disciplinas'
export const ACTIVITY_TYPES_CACHE_TAG = 'tipos:actividad'
export const ADMISSION_MODES_CACHE_TAG = 'modalidades:admision'
export const COLLECTIVES_CACHE_TAG = 'agrupaciones'

export function getEditionParticipationsCacheTag(editionId: number): string {
  return `participaciones:edicion:${editionId}`
}

export function getParticipationExhibitionsCacheTag(
  participationId: number,
): string {
  return `exposiciones:participacion:${participationId}`
}

export function getParticipationActivitiesCacheTag(
  participationId: number,
): string {
  return `actividades:participacion:${participationId}`
}

// ── Agrupaciones ──────────────────────────────
export const COLLECTIVE_CACHE_TAG = 'agrupacion'
export const COLLECTIVE_ACTIVE_CACHE_TAG = 'agrupacion:activas'
export const COLLECTIVE_DELETED_CACHE_TAG = 'agrupacion:eliminadas'

export function getCollectiveMembersCacheTag(collectiveId: number): string {
  return `agrupacion:miembros:${collectiveId}`
}

// ── Bandas ────────────────────────────────────
export const BAND_CACHE_TAG = 'bandas'
export const BAND_ACTIVE_CACHE_TAG = 'bandas:activas'
export const BAND_DELETED_CACHE_TAG = 'bandas:eliminadas'

// ── Organización ──────────────────────────────
export const ORGANIZATION_CACHE_TAG = 'organizacion'
export const TEAM_CACHE_TAG = 'organizacion:equipo'
