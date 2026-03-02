import { create } from 'zustand'

import type { EntityOperationStore } from './types'
import { generateTempId } from '@/shared/lib/utils'

export function createEntityOperationStore<T>() {
  return create<EntityOperationStore<T>>((set) => ({
    operations: null,
    lastCommitAt: null,
    add: (data) =>
      set((state) => ({
        operations: [
          ...(state.operations ?? []),
          {
            type: 'ADD',
            id: generateTempId(),
            data: { ...data },
            timestamp: Date.now()
          }
        ]
      })),
    remove: (id) =>
      set((state) => ({
        operations: [
          ...(state.operations ?? []),
          {
            type: 'DELETE',
            id,
            timestamp: Date.now()
          }
        ]
      })),

    restore: (id) =>
      set((state) => ({
        operations: [
          ...(state.operations ?? []),
          {
            type: 'RESTORE',
            id,
            timestamp: Date.now()
          }
        ]
      })),

    update: (id, data) =>
      set((state) => ({
        operations: [
          ...(state.operations ?? []),
          {
            type: 'UPDATE',
            id,
            data,
            timestamp: Date.now()
          }
        ]
      })),

    cleanup: () =>
      set({
        operations: null,
        lastCommitAt: Date.now()
      }),

    discardCleanup: () => set({ operations: null }),

    hydrate: (operations) =>
      set((state) => ({
        operations: [...(state.operations ?? []), ...operations]
      }))
  }))
}
