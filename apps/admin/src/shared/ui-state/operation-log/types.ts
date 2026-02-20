export type NewBaseEntity<T> = Omit<T, 'id'>
export type BaseEntity<T> = NewBaseEntity<T> & { id: string }

export type EntityOperation<T> =
  | {
      type: 'ADD'
      data: NewBaseEntity<T>
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
  add(data: NewBaseEntity<T>): void
  remove(id: string): void
  update(id: string, data: Partial<BaseEntity<T>>): void

  commitPendingOperations(): Promise<void>
  clearPendingOperations(): void
  clearPersistedOperations(): void

  resetStore(): void
}

export type EntityOperationStore<T> = OperationLogState<T> &
  OperationLogActions<T>
