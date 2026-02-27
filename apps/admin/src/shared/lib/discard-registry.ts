import { create } from 'zustand'
import type { JournalEntity } from './database-entities'

interface DiscardRegistryState {
  callbacks: Map<JournalEntity, () => Promise<void>>
  register: (entity: JournalEntity, fn: () => Promise<void>) => void
  unregister: (entity: JournalEntity) => void
  discardEntities: (entities: JournalEntity[]) => Promise<void>
}

export const useDiscardRegistry = create<DiscardRegistryState>((set, get) => ({
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
  discardEntities: async (entities) => {
    const { callbacks } = get()
    await Promise.all(
      entities.flatMap((entity) => {
        const fn = callbacks.get(entity)
        return fn ? [fn()] : []
      })
    )
  }
}))
