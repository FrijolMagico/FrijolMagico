export type BaseEntity<T> = T & { id: string }

export type EntityOperation<T> =
  | {
      type: 'ADD'
      data: BaseEntity<T>
      timestamp: number
    }
  | {
      type: 'UPDATE'
      id: string
      data: Partial<BaseEntity<T>>
      timestamp: number
    }
  | { type: 'DELETE'; id: string; timestamp: number }

export interface OperationLogState<T> {
  persistedOperations: EntityOperation<T>[] | null
  pendingOperations: EntityOperation<T>[] | null
  lastCommitAt: number | null
}

export interface OperationLogActions<T> {
  add(data: BaseEntity<T>): void
  remove(id: string): void
  update(id: string, data: Partial<BaseEntity<T>>): void

  commitPendingOperations(): Promise<void>
  clearPendingOperations(): void
  clearPersistedOperations(): void

  resetStore(): void
}

export type EntityOperationStore<T> = OperationLogState<T> &
  OperationLogActions<T>
