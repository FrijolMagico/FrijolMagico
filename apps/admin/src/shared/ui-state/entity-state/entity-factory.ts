import { create } from 'zustand'
import type {
  EntityUIStateStore,
  EntityState,
  EntityOperation,
  RemoteEntityData,
  AppliedChanges,
  CurrentEdits
} from './entity-types'
import { normalizeEntities } from './entity-utils'

import { memoize } from 'proxy-memoize'

export function createEntityUIStateStore<T>() {
  // Per-store instance memoization cache
  const getEffectiveDataMemoized = memoize(
    (state: {
      remoteData: RemoteEntityData<T> | null
      appliedChanges: AppliedChanges<T> | null
      currentEdits: CurrentEdits<T> | null
    }): EntityState<T> => {
      const entities: Record<string, T> = state.remoteData
        ? { ...state.remoteData.entities }
        : {}

      const deletedIds = new Set<number>()
      const addedIds = new Set<number>()

      const allOps = [
        ...(state.appliedChanges?.operations ?? []),
        ...(state.currentEdits?.operations ?? [])
      ].sort((a, b) => a.timestamp - b.timestamp)

      for (const op of allOps) {
        switch (op.type) {
          case 'ADD':
            if (
              process.env.NODE_ENV === 'development' &&
              entities[op.entityId]
            ) {
              console.warn(
                `[EntityState] Duplicate ID detected: ${op.entityId}`
              )
            }

            entities[op.entityId] = op.entity!
            addedIds.add(op.entityId)
            deletedIds.delete(op.entityId)
            break
          case 'UPDATE':
            if (entities[op.entityId]) {
              entities[op.entityId] = { ...entities[op.entityId], ...op.data }
            }
            break
          case 'DELETE':
            delete entities[op.entityId]
            deletedIds.add(op.entityId)
            addedIds.delete(op.entityId)
            break
        }
      }

      const remoteIds = state.remoteData?.entityIds ?? []
      const entityIds = remoteIds
        .filter((id) => !deletedIds.has(id))
        .concat([...addedIds].filter((id) => !deletedIds.has(id)))

      return { entities, entityIds }
    }
  )

  const selectAllMemoized = memoize((effectiveData: EntityState<T>): T[] => {
    return effectiveData.entityIds
      .map((id) => effectiveData.entities[id])
      .filter(Boolean)
  })

  return create<EntityUIStateStore<T>>((set, get) => ({
    remoteData: null,
    appliedChanges: null,
    currentEdits: null,
    nextTempId: -1,
    isLoading: false,
    error: null,

    getEffectiveData(): EntityState<T> {
      const { remoteData, appliedChanges, currentEdits } = get()
      return getEffectiveDataMemoized({
        remoteData,
        appliedChanges,
        currentEdits
      })
    },

    getHasChanges(): boolean {
      const { appliedChanges, currentEdits } = get()
      return (
        (appliedChanges?.operations?.length ?? 0) > 0 ||
        (currentEdits?.operations?.length ?? 0) > 0
      )
    },
    // NOTA: verificar si estamos métodos son realmente necesarios y hacer log de cada uno.
    selectAll(): T[] {
      return selectAllMemoized(get().getEffectiveData())
    },

    selectById(id: number): T | undefined {
      return get().getEffectiveData().entities[id]
    },

    selectIds(): number[] {
      return get().getEffectiveData().entityIds
    },

    selectEntities(): Record<string, T> {
      return get().getEffectiveData().entities
    },

    add(entity, id): void {
      let operationId: number
      if (!id) {
        operationId = get().nextTempId
      } else {
        operationId = id
      }

      const operation: EntityOperation<T> = {
        type: 'ADD',
        entityId: operationId,
        entity: { ...entity, id: operationId } as T,
        timestamp: Date.now(),
        isOptimistic: !id
      }

      set((state) => ({
        currentEdits: {
          operations: [...(state.currentEdits?.operations ?? []), operation]
        },
        nextTempId: !id ? state.nextTempId - 1 : state.nextTempId
      }))
    },

    remove(id: number): void {
      const operation: EntityOperation<T> = {
        type: 'DELETE',
        entityId: id,
        timestamp: Date.now()
      }

      set((state) => ({
        currentEdits: {
          operations: [...(state.currentEdits?.operations ?? []), operation]
        }
      }))
    },

    update(data, id): void {
      let entityId: number

      if (!id) {
        const ids = get().selectIds()

        if (ids.length === 0) {
          console.warn('[EntityState] No entities available to update')
          return
        }

        entityId = ids[0]
      }

      const operation: EntityOperation<T> = {
        type: 'UPDATE',
        entityId: id ?? entityId!,
        data,
        timestamp: Date.now()
      }

      console.log('[EntityStore] Update: ', {
        operation
      })

      // TODO: Add a validation to check if the update was restorative, that means if the new update restore the original value, we can remove the operation instead of add a new one. This way we can reduce the number of operations in the queue and also avoid unnecessary updates in the UI when the user is toggling values.

      set((state) => ({
        currentEdits: {
          operations: [...(state.currentEdits?.operations ?? []), operation]
        }
      }))
    },

    async commitCurrentEdits(): Promise<void> {
      const currentEdits = get().currentEdits
      if (!currentEdits || currentEdits.operations.length === 0) return

      // Esto se está llamando en cada re render o cada vez que editamos en componente
      console.log('[EntityStore] commitCurrentEdits: ', {
        currentEdits
      })

      set((state) => ({
        appliedChanges: {
          operations: [
            ...(state.appliedChanges?.operations ?? []),
            ...currentEdits.operations
          ],
          lastApplied: new Date()
        },
        currentEdits: null
      }))
    },

    clearCurrentEdits(): void {
      set({ currentEdits: null })
    },

    clearAppliedChanges(): void {
      set({ appliedChanges: null })
    },

    setRemoteData(data: T[]): void {
      const state = normalizeEntities(data)
      const remoteData: RemoteEntityData<T> = {
        ...state,
        lastFetched: new Date()
      }

      set({ remoteData, isLoading: false, error: null })
    },

    reset(): void {
      set({
        remoteData: null,
        appliedChanges: null,
        currentEdits: null,
        nextTempId: -1,
        isLoading: false,
        error: null
      })
    },

    setLoading(loading: boolean): void {
      set({ isLoading: loading })
    },

    setError(error: string | null): void {
      set({ error })
    }
  }))
}
