import { create } from 'zustand'
import { UIProjectionState, ProjectedEntity } from './types'

export function createUIProjectionStore<T extends { id: string }>() {
  return create<UIProjectionState<T>>((set, get) => ({
    byId: {},
    allIds: [],

    project: (remoteSnapshot, persistedOps, pendingOps) => {
      const operations = [...(persistedOps ?? []), ...(pendingOps ?? [])]

      const { byId, allIds } = get()
      const nextById = { ...byId }
      const nextAllIds = [...allIds]

      // --- 1️⃣ Sync remote snapshot base ---
      const remoteIds = new Set<string>()

      for (const entity of remoteSnapshot) {
        remoteIds.add(entity.id)

        const existing = byId[entity.id]

        // Si no existe, lo creamos
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
        }
        // Si existe y no cambió realmente, mantenemos referencia
        else {
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
      }

      set({
        byId: nextById,
        allIds: nextAllIds
      })
    },

    reset: () =>
      set({
        byId: {},
        allIds: []
      })
  }))
}
