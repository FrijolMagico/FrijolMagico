import { create } from 'zustand'

import type { EntityOperation, EntityOperationStore } from './types'
import { generateTempId } from '@/shared/lib/utils'

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
            type: 'ADD',
            data: { ...data, id: generateTempId() },
            timestamp: Date.now()
          }
        ]
      })),
    remove: (id) =>
      set((state) => ({
        pendingOperations: [
          ...(state.pendingOperations ?? []),
          {
            type: 'DELETE',
            id,
            timestamp: Date.now()
          }
        ]
      })),

    restore: (id) =>
      set((state) => ({
        pendingOperations: [
          ...(state.pendingOperations ?? []),
          {
            type: 'RESTORE',
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
            type: 'UPDATE',
            id,
            data,
            timestamp: Date.now()
          }
        ]
      })),

    commitPendingOperations: async () => {

      // Get all current pendingOperations from queue
      const pendingOperations = get().pendingOperations
      if (!pendingOperations || pendingOperations.length === 0) return

      try {
        if (commitOperations) {
          await commitOperations(pendingOperations)
        }

        set((state) => {
          // Compares by object reference intentionally — pendingOperations snapshot
          // is a subset of state.pendingOperations (Zustand preserves object identity).
          // Safe as long as operations are never deep-cloned between add() and commit().
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
        // TODO: Improve error handling
        console.error('[EntityState] Failed to commit edits:', error)
      }
    },

    clearPendingOperations: () => set({ pendingOperations: null }),
    clearPersistedOperations: () => set({ persistedOperations: null }),
    resetStore: () =>
      set({
        persistedOperations: null,
        pendingOperations: null,
        lastCommitAt: null
      }),
    commitSuccessCleanup: () =>
      set({
        persistedOperations: null,
        pendingOperations: null,
        lastCommitAt: Date.now()
      }),
    hydratePersistedOperations: (operations) =>
      set((state) => ({
        persistedOperations: [
          ...(state.persistedOperations ?? []),
          ...operations
        ]
      }))
  }))
}
