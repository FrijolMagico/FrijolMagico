import { EntityOperation } from '../operation-log'

export interface ProjectedMeta {
  isNew: boolean
  isUpdated: boolean
  isDeleted: boolean
}

export type ProjectedEntity<T> = T & {
  __meta: ProjectedMeta
}

export interface UIProjectionState<T extends { id: string }> {
  byId: Record<string, ProjectedEntity<T>>
  allIds: string[]

  project: (
    remoteSnapshot: T[],
    persistedOps: EntityOperation<T>[] | null,
    pendingOps: EntityOperation<T>[] | null
  ) => void

  reset: () => void
}
