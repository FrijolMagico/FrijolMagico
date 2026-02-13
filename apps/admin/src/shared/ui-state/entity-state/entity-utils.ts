import type { EntityState } from './entity-types'

export function normalizeEntities<T>(
  array: T[],
  idField: keyof T
): EntityState<T> {
  const entities: Record<number, T> = {}
  const ids: number[] = []

  for (const item of array) {
    const id = item[idField] as number
    entities[id] = item
    ids.push(id)
  }

  return { entities, ids }
}
