import { create } from 'zustand'
import { UIProjectionState, ProjectedEntity } from './types'
import { useSectionDirtyStore } from '@/shared/lib/section-dirty-store'

export function createUIProjectionStore<T extends { id: string }>(section: string) {
  return create<UIProjectionState<T>>((set, get) => ({
    byId: {},
    allIds: [],

    project: (remoteSnapshot, persistedOps, pendingOps) => {
      const operations = [...(persistedOps ?? []), ...(pendingOps ?? [])]

      if (operations.length === 0) {
        const byId: Record<string, ProjectedEntity<T>> = {}
        const allIds: string[] = []

        for (const entity of remoteSnapshot) {
          byId[entity.id] = {
            ...entity,
            __meta: {
              isNew: false,
              isUpdated: false,
              isDeleted: false
            }
          }
          allIds.push(entity.id)
        }

        // Early return: no operations — all entities clean
        useSectionDirtyStore.getState().setDirty(section, false)
        set({ byId, allIds })
        return
      }

      const { byId, allIds } = get()
      const nextById = { ...byId }
      const nextAllIds = [...allIds]

      const remoteIds = new Set<string>()
      const remoteMap = new Map<string, T>()

      for (const entity of remoteSnapshot) {
        remoteIds.add(entity.id)
        remoteMap.set(entity.id, entity)

        const existing = byId[entity.id]

        if (!existing) {
          nextById[entity.id] = {
            ...entity,
            __meta: {
              isNew: false,
              isUpdated: false,
              isDeleted: false
            }
          }

          nextAllIds.push(entity.id)
        } else {
          nextById[entity.id] = existing
        }
      }

      // --- 2️⃣ Apply operations ---
      for (const op of operations) {
        if (op.type === 'ADD') {
          if (!nextById[op.data.id]) {
            nextAllIds.push(op.data.id)
          }

          nextById[op.data.id] = {
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

          nextById[op.id] = {
            ...existing,
            ...op.data,
            __meta: {
              ...existing.__meta,
              isUpdated: !existing.__meta.isNew
            }
          }
        }

        if (op.type === 'DELETE') {
          const existing = nextById[op.id]
          if (!existing) continue

          nextById[op.id] = {
            ...existing,
            __meta: {
              ...existing.__meta,
              isDeleted: true
            }
          }
        }

        if (op.type === 'RESTORE') {
          const existing = nextById[op.id]
          if (!existing) continue

          nextById[op.id] = {
            ...existing,
            __meta: {
              ...existing.__meta,
              isDeleted: false
            }
          }
        }
      }

      // --- 3️⃣ Reconcile: if final projected state matches remote, clear isUpdated ---
      // Compares remote entity fields against projected entity to detect net-zero changes.
      for (const id of Object.keys(nextById)) {
        const entity = nextById[id]
        if (!entity.__meta.isUpdated) continue
        if (entity.__meta.isNew || entity.__meta.isDeleted) continue

        const remote = remoteMap.get(id)
        if (!remote) continue

        let changed = false
        for (const key of Object.keys(remote) as (keyof T)[]) {
          if (entity[key] !== remote[key]) { changed = true; break }
        }
        if (!changed) {
          nextById[id] = { ...entity, __meta: { ...entity.__meta, isUpdated: false } }
        }
      }

      // Emit dirty verdict to global read model
      const hasNetChanges = Object.values(nextById).some(
        (e) => e.__meta.isNew || e.__meta.isUpdated || e.__meta.isDeleted
      )
      useSectionDirtyStore.getState().setDirty(section, hasNetChanges)

      set({
        byId: nextById,
        allIds: nextAllIds
      })
    },

    reset: () => {
      useSectionDirtyStore.getState().clearSection(section)
      set({ byId: {}, allIds: [] })
    }
  }))
}
