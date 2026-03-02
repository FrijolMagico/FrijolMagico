export type NewBaseEntity<T> = Omit<T, 'id'>
export type BaseEntity<T> = NewBaseEntity<T> & { id: string }

export type EntityOperation<T> =
  | {
      type: 'ADD'
      id: string
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
  | { type: 'RESTORE'; id: string; timestamp: number }
