import { create } from 'zustand'
import type { Entity } from './database-entities'

/**
 * Registry of per-entity journal flush functions.
 *
 * useJournalSync registers its flush() on mount so push hooks can call it
 * imperatively (pre-push) without prop-drilling through the component tree.
 *
 * Pattern mirrors discard-registry.ts.
 */
interface JournalFlushRegistryState {
  callbacks: Map<Entity, () => Promise<void>>
  register: (entity: Entity, fn: () => Promise<void>) => void
  unregister: (entity: Entity) => void
  flush: (entity: Entity) => Promise<void>
}

export const useJournalFlushRegistry = create<JournalFlushRegistryState>(
  (set, get) => ({
    callbacks: new Map(),

    register: (entity, fn) => {
      const next = new Map(get().callbacks)
      next.set(entity, fn)
      set({ callbacks: next })
    },

    unregister: (entity) => {
      const next = new Map(get().callbacks)
      next.delete(entity)
      set({ callbacks: next })
    },

    flush: async (entity) => {
      const fn = get().callbacks.get(entity)
      if (fn) await fn()
    }
  })
)
