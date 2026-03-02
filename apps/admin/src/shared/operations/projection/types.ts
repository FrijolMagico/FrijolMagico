import { EntityOperation } from '../types'

export interface ProjectedMeta {
  isNew: boolean
  isUpdated: boolean
  isDeleted: boolean
}

export type ProjectedEntity<T> = T & {
  __meta?: ProjectedMeta
}

export interface ProjectionStore<T extends { id: string }> {
  byId: Record<string, ProjectedEntity<T>>
  allIds: string[]
  lastAppliedTimestamp: number | null
  lastRemoteSnapshotHash: string | null

  project: (
    remoteSnapshot: T[],
    operations: EntityOperation<T>[] | null
  ) => void

  reset: () => void
}
