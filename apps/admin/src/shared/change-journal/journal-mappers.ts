/**
 * @fileoverview journal-mappers.ts - Journal Entry to EntityOperation Mappers
 *
 * Converts persisted journal entries back into EntityOperations for store
 * restoration. UPDATE operations are stored as per-field entries
 * (section:id:field) and must be grouped back into a single UPDATE per entity.
 *
 * @connection change-journal.ts - Public API (getLatestEntries)
 * @connection entity-types.ts - EntityOperation<T> interface
 */

import { EntityOperation, BaseEntity } from '../ui-state/operation-log'
import type { JournalEntry } from './lib/types'

/**
 * Convert journal entries to EntityOperations for store restoration.
 * Groups field-level entries into single UPDATE operations per entity.
 *
 * @param entries - Journal entries from getLatestEntries() (newest first)
 * @returns EntityOperation[] sorted by timestamp ASC for correct application
 */
export function journalEntriesToOperations<T>(
  entries: JournalEntry[]
): EntityOperation<T>[] {
  const operations: EntityOperation<T>[] = []
  const fieldUpdates = new Map<
    string,
    { data: Record<string, unknown>; timestamp: number }
  >()

  for (const entry of entries) {
    const parts = entry.scopeKey.split(':')
    const entityId = parts[1]

    if (!entityId) continue

    const { payload } = entry
    const field = parts[2]

    if (payload.op === 'unset') {
      operations.push({
        type: 'DELETE',
        id: entityId,
        timestamp: entry.timestampMs
      })
    } else if (payload.op === 'restore') {
      operations.push({
        type: 'RESTORE',
        id: entityId,
        timestamp: entry.timestampMs
      })
    } else if (payload.op === 'set' && field) {
      const existing = fieldUpdates.get(entityId)
      if (existing) {
        existing.data[field] = payload.value
        existing.timestamp = Math.max(existing.timestamp, entry.timestampMs)
      } else {
        fieldUpdates.set(entityId, {
          data: { [field]: payload.value },
          timestamp: entry.timestampMs
        })
      }
    } else if (payload.op === 'set' && !field) {
      operations.push({
        type: 'ADD',
        data: payload.value as unknown as BaseEntity<T>,
        timestamp: entry.timestampMs
      })
    } else if (payload.op === 'patch') {
      operations.push({
        type: 'UPDATE',
        id: entityId,
        data: payload.value as Partial<BaseEntity<T>>,
        timestamp: entry.timestampMs
      })
    }
  }

  for (const [entityId, { data, timestamp }] of fieldUpdates) {
    operations.push({
      type: 'UPDATE',
      id: entityId,
      data: data as Partial<BaseEntity<T>>,
      timestamp
    })
  }

  operations.sort((a, b) => a.timestamp - b.timestamp)

  return operations
}
