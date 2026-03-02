import { BaseEntity, EntityOperation, NewBaseEntity } from '../types'

export interface OperationLogState<T> {
  operations: EntityOperation<T>[] | null
  lastCommitAt: number | null
}

export interface OperationLogActions<T> {
  add(data: NewBaseEntity<T>): void
  remove(id: string): void
  update(id: string, data: Partial<BaseEntity<T>>): void
  restore(id: string): void

  cleanup(): void
  discardCleanup(): void
  hydrate(operations: EntityOperation<T>[]): void
}

export type EntityOperationStore<T> = OperationLogState<T> &
  OperationLogActions<T>
