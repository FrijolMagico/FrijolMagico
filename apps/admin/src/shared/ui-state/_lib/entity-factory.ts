import { create } from 'zustand'
import type {
  EntityUIStateStore,
  EntityState,
  EntityOperation,
  RemoteEntityData,
  AppliedChanges,
  CurrentEdits
} from './entity-types'
import {
  generateTempId,
  normalizeEntities,
  denormalizeEntities
} from './entity-utils'

export interface CreateEntityUIStateStoreConfig<T> {
  sectionName: string
  idField: keyof T
  isSingleton?: boolean
  writeToJournal?: (operation: EntityOperation<T>) => Promise<void>
}

export function createEntityUIStateStore<T>(
  config: CreateEntityUIStateStoreConfig<T>
) {
  return create<EntityUIStateStore<T>>((set, get) => ({
    remoteData: null,
    appliedChanges: null,
    currentEdits: null,
    isLoading: false,
    error: null,

    getEffectiveData(): EntityState<T> {
      const { remoteData, appliedChanges, currentEdits } = get()

      const entities: Record<string, T> = remoteData
        ? { ...remoteData.entities }
        : {}
      const deletedIds = new Set<string>()
      const addedIds = new Set<string>()

      const allOps = [
        ...(appliedChanges?.operations ?? []),
        ...(currentEdits?.operations ?? [])
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

      const remoteIds = remoteData?.ids ?? []
      const ids = remoteIds
        .filter((id) => !deletedIds.has(id))
        .concat([...addedIds].filter((id) => !deletedIds.has(id)))

      return { entities, ids }
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
      return denormalizeEntities(get().getEffectiveData())
    },

    selectById(id: string): T | undefined {
      return get().getEffectiveData().entities[id]
    },

    selectIds(): string[] {
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

    addOne(entity: T, id?: string): void {
      const entityId = entity[config.idField] as string | undefined
      const finalId = id ?? entityId ?? generateTempId()
      const operation: EntityOperation<T> = {
        type: 'ADD',
        id: finalId,
        entity: { ...entity, [config.idField]: finalId } as T,
        timestamp: Date.now(),
        isOptimistic: !id && !entityId
      }

      set((state) => ({
        currentEdits: {
          operations: [...(state.currentEdits?.operations ?? []), operation]
        }
      }))
    },

    updateOne(id: string, data: Partial<T>): void {
      const operation: EntityOperation<T> = {
        type: 'UPDATE',
        id,
        data,
        timestamp: Date.now()
      }

      set((state) => ({
        currentEdits: {
          operations: [...(state.currentEdits?.operations ?? []), operation]
        }
      }))
    },

    removeOne(id: string): void {
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
      const id = String(entity[config.idField])
      const exists = !!get().selectById(id)

      if (exists) {
        get().updateOne(id, entity)
      } else {
        get().addOne(entity, id)
      }
    },

    addMany(entities: T[]): void {
      const operations: EntityOperation<T>[] = entities.map((entity) => {
        const entityId = entity[config.idField] as string | undefined
        const id = entityId ?? generateTempId()
        return {
          type: 'ADD',
          id,
          entity: { ...entity, [config.idField]: id } as T,
          timestamp: Date.now(),
          isOptimistic: !entityId
        }
      })

      set((state) => ({
        currentEdits: {
          operations: [...(state.currentEdits?.operations ?? []), ...operations]
        }
      }))
    },

    updateMany(updates: { id: string; data: Partial<T> }[]): void {
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

    removeMany(ids: string[]): void {
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

    update(data: Partial<T>): void {
      if (config.isSingleton) {
        const currentData = get().selectOne()
        if (currentData) {
          const id = String(currentData[config.idField])
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
