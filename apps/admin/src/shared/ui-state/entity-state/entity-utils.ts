import type { EntityState } from './entity-types'

export function normalizeEntities<T>(array: T[]): EntityState<T> {
  const entities: Record<number, T> = {}
  const ids: number[] = []

  for (let id = 0; id < array.length; id++) {
    const item = array[id]
    entities[id] = item
    ids.push(id)
  }

  return { entities, entityIds: ids }
}
