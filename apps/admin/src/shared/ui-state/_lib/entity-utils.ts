import type { EntityState } from './entity-types'

let tempIdCounter = 0

export function generateTempId(): string {
  return `temp-${Date.now()}-${++tempIdCounter}`
}

export function normalizeEntities<T>(
  array: T[],
  idField: keyof T
): EntityState<T> {
  const entities: Record<string, T> = {}
  const ids: string[] = []

  for (const item of array) {
    const id = String(item[idField])
    entities[id] = item
    ids.push(id)
  }

  return { entities, ids }
}

export function denormalizeEntities<T>(state: EntityState<T>): T[] {
  return state.ids.map((id) => state.entities[id]).filter(Boolean)
}
