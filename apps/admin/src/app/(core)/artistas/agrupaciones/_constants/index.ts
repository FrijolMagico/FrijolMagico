export const AGRUPACION_CACHE_TAG = 'agrupacion'
export const AGRUPACION_ACTIVE_CACHE_TAG = 'agrupacion-active'
export const AGRUPACION_DELETED_CACHE_TAG = 'agrupacion-deleted'
export const DEFAULT_PAGE_SIZE = 20

export const CREATE_AGRUPACION_FORM_ID = 'create-agrupacion-form'
export const UPDATE_AGRUPACION_FORM_ID = 'update-agrupacion-form'

export function getAgrupacionMembersCacheTag(agrupacionId: number) {
  return `admin:agrupacion:members:${agrupacionId}`
}
