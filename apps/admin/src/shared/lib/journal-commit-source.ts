/**
 * journal-commit-source.ts - Connector: Change Journal → CommitSource contract
 *
 * Adapts the change-journal module to the CommitSource interface.
 * Lives in shared/lib/ as glue code between decoupled modules.
 *
 * Mapping Rules:
 *   Journal op:'set' + no field + isTempId(entityId) → CREATE (unwrap EntityOperation wrapper)
 *   Journal op:'set' + no field + !isTempId(entityId) → UPDATE (unwrap EntityOperation wrapper)
 *   Journal op:'set' + field → group per entity → single UPDATE
 *   Journal op:'patch' → UPDATE (value is already a partial object)
 *   Journal op:'unset' → DELETE
 *   Journal op:'restore' → RESTORE
 *
 *   entityType = scopeKey.split(':')[0]
 *   entityId = scopeKey.split(':')[1]
 *   field = scopeKey.split(':')[2] (per-field UPDATE only)
 */

import {
  getLatestEntries,
  hasEntries,
  clearSection
} from '@/shared/change-journal/change-journal'
import { isTempId } from '@/shared/commit-system/lib/id-mapper'
import {
  COMMIT_OPERATION_TYPE,
  type CommitOperation,
  type CommitSource
} from '@/shared/commit-system/lib/types'
import type { JournalEntry } from '@/shared/change-journal/lib/types'

/**
 * Process journal entries into CommitOperations.
 *
 * Handles the format asymmetry from writeOperationIntoJournal:
 * - ADD ops store the full EntityOperation wrapper as value
 * - UPDATE per-field ops store plain scalar values with field in scopeKey
 * - PATCH ops store a partial object directly
 * - DELETE/RESTORE have no value
 *
 * Entries from getLatestEntries are newest-first, so for per-field grouping
 * we keep only the first (newest) value per field.
 */
function processEntries(entries: JournalEntry[]): CommitOperation[] {
  const operations: CommitOperation[] = []
  const fieldUpdates = new Map<
    string,
    { entityType: string; entityId: string; data: Record<string, unknown> }
  >()

  for (const entry of entries) {
    const parts = entry.scopeKey.split(':')
    const entityType = parts[0]
    const entityId = parts[1]
    const field = parts[2]

    if (!entityType || !entityId) {
      console.warn(`Invalid scopeKey format: ${entry.scopeKey}`)
      continue
    }

    const { op } = entry.payload

    if (op === 'unset') {
      // DELETE: no value, scopeKey = section:entityId
      operations.push({
        type: COMMIT_OPERATION_TYPE.DELETE,
        entityType,
        entityId
      })
    } else if (op === 'restore') {
      // RESTORE: no value, scopeKey = section:entityId
      operations.push({
        type: COMMIT_OPERATION_TYPE.RESTORE,
        entityType,
        entityId
      })
    } else if (op === 'set' && field) {
      // UPDATE per-field: scopeKey = section:entityId:field, value is plain scalar
      // Group all fields for the same entity into a single UPDATE
      const key = `${entityType}:${entityId}`
      const existing = fieldUpdates.get(key)
      if (existing) {
        // Entries are newest-first: only set field if not already present
        if (!(field in existing.data)) {
          existing.data[field] = entry.payload.value
        }
      } else {
        fieldUpdates.set(key, {
          entityType,
          entityId,
          data: { [field]: entry.payload.value }
        })
      }
    } else if (op === 'set' && !field) {
      // ADD: scopeKey = section:entityId, value is EntityOperation wrapper { type, data, timestamp }
      // Unwrap to get the actual entity data
      const wrappedOp = entry.payload.value as {
        data: Record<string, unknown>
      }
      const operationType = isTempId(entityId)
        ? COMMIT_OPERATION_TYPE.CREATE
        : COMMIT_OPERATION_TYPE.UPDATE
      operations.push({
        type: operationType,
        entityType,
        entityId,
        data: wrappedOp.data
      })
    } else if (op === 'patch') {
      // PATCH: value is already a partial object, map as UPDATE
      const operationType = isTempId(entityId)
        ? COMMIT_OPERATION_TYPE.CREATE
        : COMMIT_OPERATION_TYPE.UPDATE
      operations.push({
        type: operationType,
        entityType,
        entityId,
        data: entry.payload.value as Record<string, unknown>
      })
    }
  }

  // Emit grouped UPDATE operations from field-level entries
  for (const [, { entityType, entityId, data }] of fieldUpdates) {
    operations.push({
      type: COMMIT_OPERATION_TYPE.UPDATE,
      entityType,
      entityId,
      data
    })
  }

  return operations
}

export const journalCommitSource: CommitSource = {
  async read(section: string): Promise<CommitOperation[]> {
    const entries = await getLatestEntries(section)
    return processEntries(entries)
  },

  async hasPending(section: string): Promise<boolean> {
    return hasEntries(section)
  },

  async clear(section: string): Promise<void> {
    await clearSection(section)
  }
}