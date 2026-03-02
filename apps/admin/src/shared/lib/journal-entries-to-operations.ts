/**
 * @fileoverview journal-entries-to-operations.ts - Journal Entry to EntityOperation Mapper
 *
 * Converts persisted journal entries back into EntityOperations for store
 * restoration. UPDATE operations are stored as per-field entries
 * (section:id:field) and must be grouped back into a single UPDATE per entity.
 *
 * @connection change-journal.ts - Public API (getLatestEntries)
 * @connection entity-types.ts - EntityOperation<T> interface
 */

import { JournalEntry } from '../operations/journal/lib/types'
import { BaseEntity, EntityOperation } from '../operations/types'

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
        // FIX: Only set field if not already present (entries are newest-first, preserve newest value)
        if (!(field in existing.data)) {
          existing.data[field] = payload.value
        }
        existing.timestamp = Math.max(existing.timestamp, entry.timestampMs)
      } else {
        fieldUpdates.set(entityId, {
          data: { [field]: payload.value },
          timestamp: entry.timestampMs
        })
      }
    } else if (payload.op === 'set' && !field) {
      // writeOperationIntoJournal stores the full operation as value: { type: 'ADD', data: BaseEntity<T>, timestamp }
      // We need to extract .data from the wrapped operation
      const wrappedOp = payload.value as { data: BaseEntity<T> }
      operations.push({
        type: 'ADD',
        id: entityId,
        data: wrappedOp.data,
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
