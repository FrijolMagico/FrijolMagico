import { shallow } from 'zustand/shallow'
import { ProjectedEntity } from './types'

/**
 * Custom equality function for ProjectedEntity objects.
 * Shallow compares the top-level fields, but ALSO shallow compares the nested `__meta` object.
 * This prevents unnecessary object creation and re-renders when the actual content hasn't changed.
 */
export function isProjectedEntityEqual<T>(
  existing: ProjectedEntity<T>,
  proposed: ProjectedEntity<T>
): boolean {
  if (!existing || !proposed) return existing === proposed

  // Handle __meta property specially
  const existingMeta = existing.__meta || {
    isNew: false,
    isUpdated: false,
    isDeleted: false
  }
  const proposedMeta = proposed.__meta || {
    isNew: false,
    isUpdated: false,
    isDeleted: false
  }

  if (!shallow(existingMeta, proposedMeta)) {
    return false
  }

  // Compare all other keys
  for (const key in proposed) {
    if (key === '__meta') continue
    if (
      existing[key as keyof ProjectedEntity<T>] !==
      proposed[key as keyof ProjectedEntity<T>]
    ) {
      return false
    }
  }

  for (const key in existing) {
    if (key === '__meta') continue
    if (!(key in proposed)) return false
  }

  return true
}

/**
 * Computes a fast string hash of a remote snapshot to detect external changes.
 * Relies on `id` and `updatedAt` (if present) to uniquely identify the data state.
 */
export function hashRemoteSnapshot<
  T extends { id: string; updatedAt?: string }
>(remoteSnapshot: T[]): string {
  if (remoteSnapshot.length === 0) return 'empty'

  let hashStr = ''
  for (const item of remoteSnapshot) {
    hashStr += `${item.id}:${item.updatedAt ?? ''}|`
  }
  return hashStr
}
