export const COLLECTIVE_CACHE_TAG = 'admin:collective'
export const COLLECTIVE_ACTIVE_CACHE_TAG = 'admin:collective:active'
export const COLLECTIVE_DELETED_CACHE_TAG = 'admin:collective:deleted'
export const DEFAULT_PAGE_SIZE = 20
export const AVAILABLE_ARTISTS_PRELOAD_THRESHOLD = 200

export const CREATE_COLLECTIVE_FORM_ID = 'create-collective-form'
export const UPDATE_COLLECTIVE_FORM_ID = 'update-collective-form'

export function getCollectiveMembersCacheTag(collectiveId: number) {
  return `admin:collective:members:${collectiveId}`
}
