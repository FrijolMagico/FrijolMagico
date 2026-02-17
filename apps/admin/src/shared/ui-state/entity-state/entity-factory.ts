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

export interface CreateEntityUIStateStoreConfig<T> {
  sectionName: string
  idField: keyof T
  isSingleton?: boolean
  writeToJournal?: (operation: EntityOperation<T>) => Promise<void>
}

export function createEntityUIStateStore<T>(
  config: CreateEntityUIStateStoreConfig<T>
) {
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
            entities[op.id] = op.entity!
            addedIds.add(op.id)
            deletedIds.delete(op.id)
            break
          case 'UPDATE':
            if (entities[op.id]) {
              entities[op.id] = { ...entities[op.id], ...op.data }
            }
            break
          case 'DELETE':
            delete entities[op.id]
            deletedIds.add(op.id)
            addedIds.delete(op.id)
            break
        }
      }

      const remoteIds = state.remoteData?.ids ?? []
      const ids = remoteIds
        .filter((id) => !deletedIds.has(id))
        .concat([...addedIds].filter((id) => !deletedIds.has(id)))

      return { entities, ids }
    }
  )

  const selectAllMemoized = memoize((effectiveData: EntityState<T>): T[] => {
    return effectiveData.ids
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

    getHasUnsavedEdits(): boolean {
      const { currentEdits } = get()
      return (currentEdits?.operations?.length ?? 0) > 0
    },

    selectAll(): T[] {
      return selectAllMemoized(get().getEffectiveData())
    },

    selectById(id: number): T | undefined {
      return get().getEffectiveData().entities[id]
    },

    selectIds(): number[] {
      return get().getEffectiveData().ids
    },

    selectEntities(): Record<string, T> {
      return get().getEffectiveData().entities
    },

    selectTotal(): number {
      return get().getEffectiveData().ids.length
    },

    selectOne(): T | null {
      const state = get().getEffectiveData()
      const ids = state.ids
      if (ids.length === 0) return null
      return state.entities[ids[0]] || null
    },

    addOne(entity, id): void {
      const entityId = entity[config.idField] as number | undefined
      const finalId = id ?? entityId

      let operationId: number
      if (finalId === undefined) {
        operationId = get().nextTempId
      } else {
        operationId = finalId
      }

      const operation: EntityOperation<T> = {
        type: 'ADD',
        id: operationId,
        entity: { ...entity, [config.idField]: operationId } as T,
        timestamp: Date.now(),
        isOptimistic: id === undefined && entityId === undefined
      }

      set((state) => ({
        currentEdits: {
          operations: [...(state.currentEdits?.operations ?? []), operation]
        },
        nextTempId:
          finalId === undefined ? state.nextTempId - 1 : state.nextTempId
      }))
    },

    updateOne(id: number, data: Partial<T>): void {
      const operation: EntityOperation<T> = {
        type: 'UPDATE',
        id,
        data,
        timestamp: Date.now()
      }

      // TODO: Add a validation to check if the update was restorative, that means if the new update restore the original value, we can remove the operation instead of add a new one. This way we can reduce the number of operations in the queue and also avoid unnecessary updates in the UI when the user is toggling values.

      set((state) => ({
        currentEdits: {
          operations: [...(state.currentEdits?.operations ?? []), operation]
        }
      }))
    },

    removeOne(id: number): void {
      const operation: EntityOperation<T> = {
        type: 'DELETE',
        id,
        timestamp: Date.now()
      }

      set((state) => ({
        currentEdits: {
          operations: [...(state.currentEdits?.operations ?? []), operation]
        }
      }))
    },

    upsertOne(entity: T): void {
      const id = entity[config.idField] as number
      const exists = !!get().selectById(id)

      if (exists) {
        get().updateOne(id, entity)
      } else {
        get().addOne(entity, id)
      }
    },

    addMany(entities: T[]): void {
      let currentNextTempId = get().nextTempId
      const operations: EntityOperation<T>[] = entities.map((entity) => {
        const entityId = entity[config.idField] as number | undefined
        const id: number = entityId ?? currentNextTempId
        if (entityId === undefined) {
          currentNextTempId--
        }
        return {
          type: 'ADD',
          id,
          entity: { ...entity, [config.idField]: id } as T,
          timestamp: Date.now(),
          isOptimistic: entityId === undefined
        }
      })

      set((state) => ({
        currentEdits: {
          operations: [...(state.currentEdits?.operations ?? []), ...operations]
        },
        nextTempId: currentNextTempId
      }))
    },

    updateMany(updates): void {
      const operations: EntityOperation<T>[] = updates.map((update) => ({
        type: 'UPDATE',
        id: update.id,
        data: update.data,
        timestamp: Date.now()
      }))

      set((state) => ({
        currentEdits: {
          operations: [...(state.currentEdits?.operations ?? []), ...operations]
        }
      }))
    },

    removeMany(ids): void {
      const operations: EntityOperation<T>[] = ids.map((id) => ({
        type: 'DELETE',
        id,
        timestamp: Date.now()
      }))

      set((state) => ({
        currentEdits: {
          operations: [...(state.currentEdits?.operations ?? []), ...operations]
        }
      }))
    },

    upsertMany(entities: T[]): void {
      for (const entity of entities) {
        get().upsertOne(entity)
      }
    },

    setAll(entities: T[]): void {
      const state = normalizeEntities(entities, config.idField)
      const remoteData: RemoteEntityData<T> = {
        ...state,
        lastFetched: new Date()
      }

      set({
        remoteData,
        appliedChanges: null,
        currentEdits: null
      })
    },

    update(data): void {
      if (config.isSingleton) {
        const currentData = get().selectOne()
        if (currentData) {
          const id = currentData[config.idField] as number
          get().updateOne(id, data)
        }
      }
    },

    set(data: T): void {
      if (config.isSingleton) {
        get().setRemoteData([data])
      }
    },

    async commitCurrentEdits(): Promise<void> {
      const { currentEdits } = get()
      if (!currentEdits || currentEdits.operations.length === 0) return

      if (config.writeToJournal) {
        for (const operation of currentEdits.operations) {
          await config.writeToJournal(operation)
        }
      }

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

    setRemoteData(
      data: T[],
      options?: { page?: number; pageSize?: number; total?: number }
    ): void {
      const state = normalizeEntities(data, config.idField)
      const remoteData: RemoteEntityData<T> = {
        ...state,
        lastFetched: new Date()
      }

      if (options?.page !== undefined && options?.pageSize !== undefined) {
        const existingPages =
          get().remoteData?.pagination?.pagesLoaded ?? new Set<number>()
        remoteData.pagination = {
          total: options.total ?? data.length,
          pageSize: options.pageSize,
          currentPage: options.page,
          pagesLoaded: new Set([...existingPages, options.page])
        }
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
