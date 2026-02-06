/**
 * Draft data structure stored in localStorage
 */
export interface DraftData<T> {
  data: T
  updatedAt: string
  serverUpdatedAt?: string
}

/**
 * Draft manager interface
 */
export interface DraftManager<T> {
  start: () => () => void
  clear: () => void
  getDraft: () => DraftData<T> | null
  hasDraft: () => boolean
}
