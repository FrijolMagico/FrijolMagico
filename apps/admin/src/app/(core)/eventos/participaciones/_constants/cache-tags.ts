export const PARTICIPATIONS_CACHE_TAG = 'admin:participations'
export const EXHIBITION_CACHE_TAG = 'admin:exposicion'
export const ACTIVITY_CACHE_TAG = 'admin:actividad'
export const ACTIVITY_DETAIL_CACHE_TAG = 'admin:actividad-detalle'
export const DISCIPLINES_CACHE_TAG = 'admin:disciplinas'
export const ACTIVITY_TYPES_CACHE_TAG = 'admin:activity-types'
export const ADMISSION_MODES_CACHE_TAG = 'admin:admission-modes'
export const COLLECTIVES_CACHE_TAG = 'admin:agrupaciones'

export function getEditionParticipationsCacheTag(editionId: number): string {
  return `admin:participations:edition:${editionId}`
}

export function getParticipationExhibitionsCacheTag(
  participationId: number
): string {
  return `admin:exposicion:participation:${participationId}`
}

export function getParticipationActivitiesCacheTag(
  participationId: number
): string {
  return `admin:actividad:participation:${participationId}`
}
