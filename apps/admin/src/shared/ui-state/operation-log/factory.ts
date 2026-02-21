import { create } from 'zustand'

import type { EntityOperation, EntityOperationStore } from './types'

interface CreateEntityOperationStoreOpts<T> {
  commitOperations?: (operations: EntityOperation<T>[]) => Promise<void>
}

export function createEntityOperationStore<T>({
  commitOperations
}: CreateEntityOperationStoreOpts<T>) {
  return create<EntityOperationStore<T>>((set, get) => ({
    persistedOperations: null,
    pendingOperations: null,
    lastCommitAt: null,

    add: (data) =>
      set((state) => ({
        pendingOperations: [
          ...(state.pendingOperations ?? []),
          {
            // Add operation
            type: 'ADD',
            data: { ...data, id: crypto.randomUUID() },
            timestamp: Date.now()
          }
        ]
      })),

    remove: (id) =>
      set((state) => ({
        pendingOperations: [
          ...(state.pendingOperations ?? []),
          {
            // Delete operation
            type: 'DELETE',
            id,
            timestamp: Date.now()
          }
        ]
      })),

    update: (id, data) =>
      set((state) => ({
        pendingOperations: [
          ...(state.pendingOperations ?? []),
          {
            // Update operation
            type: 'UPDATE',
            id,
            data,
            timestamp: Date.now()
          }
        ]
      })),

    commitPendingOperations: async () => {
      const pendingOperations = get().pendingOperations
      if (!pendingOperations || pendingOperations.length === 0) return

      try {
        if (commitOperations) {
          console.log('[EntityStore] Committing operation: ', {
            pendingOperations
          })

          await commitOperations(pendingOperations)
        }

        set((state) => {
          const remaining = state.pendingOperations?.filter(
            (op) => !pendingOperations.includes(op)
          )

          return {
            persistedOperations: [
              ...(state.persistedOperations ?? []),
              ...pendingOperations
            ],
            pendingOperations: remaining?.length ? remaining : null,
            lastCommitAt: Date.now()
          }
        })
      } catch (error) {
        // TODO: Improve error handling here, maybe add a retry
        console.error('[EntityState] Failed to commit edits:', error)
      }
    },

    clearPendingOperations: () => set({ pendingOperations: null }),
    clearPersistedOperations: () => set({ persistedOperations: null }),
    resetStore: () =>
      set({
        persistedOperations: null,
        pendingOperations: null
      })
  }))
}
