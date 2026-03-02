import { create } from 'zustand'
import { shallow } from 'zustand/shallow'
import { isProjectedEntityEqual, hashRemoteSnapshot } from './utils'
import { ProjectionStore, ProjectedEntity } from './types'

export function createProjectionStore<
  T extends { id: string; updatedAt?: string }
>() {
  return create<ProjectionStore<T>>((set, get) => ({
    byId: {},
    allIds: [],
    lastAppliedTimestamp: null,
    lastRemoteSnapshotHash: null,

    project: (remoteSnapshot, operations) => {
      // null is an explicit discard signal — force full rebuild from remote snapshot
      const forceRebuild = operations === null
      operations = operations ?? []

      const state = get()
      const currentHash = hashRemoteSnapshot(remoteSnapshot)

      // Determine if we need a full rebuild (hash changed, first run, or explicit discard signal)
      const needsFullRebuild = forceRebuild || state.lastRemoteSnapshotHash !== currentHash

      let nextById: Record<string, ProjectedEntity<T>>
      let nextAllIds: string[]
      let opsToProcess = operations

      // We'll keep track of which entities were modified in this specific tick
      const touchedIds = new Set<string>()

      if (needsFullRebuild) {
        // --- FULL REBUILD ---
        // Create base projection directly from remote (no __meta overhead)
        nextById = {}
        nextAllIds = []

        for (const entity of remoteSnapshot) {
          nextById[entity.id] = { ...entity }
          nextAllIds.push(entity.id)
        }
        // Ops to process: ALL
      } else {
        // --- INCREMENTAL UPDATE ---
        // Copy references from existing state
        nextById = { ...state.byId }
        nextAllIds = [...state.allIds]

        // Filter only new operations
        const lastApplied = state.lastAppliedTimestamp || 0
        opsToProcess = operations.filter((op) => op.timestamp > lastApplied)

        if (opsToProcess.length === 0) {
          // Nothing new to apply, and snapshot hasn't changed. We're done.
          return
        }
      }

      // --- APPLY OPERATIONS ---
      for (const op of opsToProcess) {
        touchedIds.add(op.id)

        if (op.type === 'ADD') {
          if (!nextById[op.id]) {
            nextAllIds.push(op.id)
          }

          nextById[op.id] = {
            ...op.data,
            __meta: {
              isNew: true,
              isUpdated: false,
              isDeleted: false
            }
          } as unknown as ProjectedEntity<T>
        }

        if (op.type === 'UPDATE') {
          const existing = nextById[op.id]
          if (!existing) continue

          const proposed = {
            ...existing,
            ...op.data,
            __meta: {
              ...existing.__meta,
              isNew: existing.__meta?.isNew ?? false,
              isDeleted: existing.__meta?.isDeleted ?? false,
              // If it's new, it's not "updated" per se
              isUpdated: !(existing.__meta?.isNew ?? false)
            }
          }

          if (!isProjectedEntityEqual(existing, proposed)) {
            nextById[op.id] = proposed as unknown as ProjectedEntity<T>
          }
        }

        if (op.type === 'DELETE') {
          const existing = nextById[op.id]
          if (!existing) continue

          const proposed = {
            ...existing,
            __meta: {
              ...existing.__meta,
              isNew: existing.__meta?.isNew ?? false,
              isUpdated: existing.__meta?.isUpdated ?? false,
              isDeleted: true
            }
          }

          if (!isProjectedEntityEqual(existing, proposed)) {
            nextById[op.id] = proposed as unknown as ProjectedEntity<T>
          }
        }

        if (op.type === 'RESTORE') {
          const existing = nextById[op.id]
          if (!existing) continue

          const proposed = {
            ...existing,
            __meta: {
              ...existing.__meta,
              isNew: existing.__meta?.isNew ?? false,
              isUpdated: existing.__meta?.isUpdated ?? false,
              isDeleted: false
            }
          }

          if (!isProjectedEntityEqual(existing, proposed)) {
            nextById[op.id] = proposed as unknown as ProjectedEntity<T>
          }
        }
      }

      // --- RECONCILE ---
      // We only need to check entities we just modified.
      // If their final projected state matches the remote exactly, we clear `isUpdated`.
      const remoteMap = new Map<string, T>()
      for (const entity of remoteSnapshot) {
        remoteMap.set(entity.id, entity)
      }

      for (const id of touchedIds) {
        const entity = nextById[id]
        if (!entity || !entity.__meta?.isUpdated) continue
        if (entity.__meta.isNew || entity.__meta.isDeleted) continue

        const remote = remoteMap.get(id)
        if (!remote) continue

        let changed = false
        // Compare remote fields against projected fields
        for (const key of Object.keys(remote) as (keyof T)[]) {
          if (entity[key] !== remote[key]) {
            changed = true
            break
          }
        }

        if (!changed) {
          // It's a net-zero change (e.g. user toggled switch on, then off)
          const proposed = {
            ...entity,
            __meta: { ...entity.__meta, isUpdated: false }
          }

          if (!isProjectedEntityEqual<T>(entity, proposed)) {
            nextById[id] = proposed
          }
        }
      }

      // Calculate new cursor
      const newCursor =
        operations.length > 0
          ? Math.max(...operations.map((o) => o.timestamp))
          : state.lastAppliedTimestamp

      set({
        byId: shallow(state.byId, nextById) ? state.byId : nextById,
        allIds: shallow(state.allIds, nextAllIds) ? state.allIds : nextAllIds,
        lastAppliedTimestamp: newCursor,
        lastRemoteSnapshotHash: currentHash
      })
    },

    reset: () => {
      set({
        byId: {},
        allIds: [],
        lastAppliedTimestamp: null,
        lastRemoteSnapshotHash: null
      })
    }
  }))
}
