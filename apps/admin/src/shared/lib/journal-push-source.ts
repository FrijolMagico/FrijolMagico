/**
 * journal-push-source.ts - Connector: Change Journal → PushSource contract
 *
 * Adapts the change-journal module to the PushSource interface.
 * Lives in shared/lib/ as glue code between decoupled modules.
 *
 * Mapping Rules:
 *   Journal op:'set' + no field + isTempId(entityId) → CREATE (merge with any per-field updates)
 *   Journal op:'set' + no field + !isTempId(entityId) → UPDATE (unwrap EntityOperation wrapper)
 *   Journal op:'set' + field → group per entity → single UPDATE (skip if entity deleted)
 *   Journal op:'patch' → UPDATE (value is already a partial object)
 *   Journal op:'unset' → DELETE (filters out older updates for same entity)
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
} from '@/shared/operations/journal/'
import { isTempId } from '@/shared/push/lib/id-mapper'
import {
  PUSH_OPERATION_TYPE,
  type PushOperation,
  type PushSource
} from '@/shared/push/lib/types'
import type { JournalEntry } from '@/shared/operations/journal/lib/types'

/**
 * Process journal entries into PushOperations.
 *
 * Handles the format asymmetry from writeOperationIntoJournal:
 * - ADD ops store the full EntityOperation wrapper as value
 * - UPDATE per-field ops store plain scalar values with field in scopeKey
 * - PATCH ops store a partial object directly
 * - DELETE/RESTORE have no value
 *
 * Key behaviors:
 * - Entries from getLatestEntries are newest-first
 * - DELETE filters out older per-field updates for the same entity
 * - For temp IDs with ADD + per-field updates: merge into single CREATE
 * - For deleted entities: skip any UPDATE operations
 */
function processEntries(entries: JournalEntry[]): PushOperation[] {
  const operations: PushOperation[] = []

  // Track entities that have DELETE to filter out older updates
  const deletedEntities = new Set<string>()

  // Track pending ADD operations by entity to merge with subsequent per-field updates
  // Key: entityType:entityId, Value: { entityType, entityId, data }
  const pendingAdds = new Map<
    string,
    { entityType: string; entityId: string; data: Record<string, unknown> }
  >()

  // Collect all per-field updates (to filter by DELETE or merge with ADD)
  const fieldUpdates = new Map<
    string,
    { entityType: string; entityId: string; data: Record<string, unknown> }
  >()

  // First pass: track DELETE and build pending structures
  for (const entry of entries) {
    const parts = entry.scopeKey.split(':')
    const entityType = parts[0]
    const entityId = parts[1]
    const field = parts[2]

    if (!entityType || !entityId) {
      console.warn(`Invalid scopeKey format: ${entry.scopeKey}`)
      continue
    }

    const entityKey = `${entityType}:${entityId}`
    const { op } = entry.payload

    // Track DELETE operations - will filter out later updates
    if (op === 'unset') {
      deletedEntities.add(entityKey)
      operations.push({
        type: PUSH_OPERATION_TYPE.DELETE,
        entityType,
        entityId
      })
      continue
    }

    // Track RESTORE operations
    if (op === 'restore') {
      operations.push({
        type: PUSH_OPERATION_TYPE.RESTORE,
        entityType,
        entityId
      })
      continue
    }

    // Handle ADD (op='set' without field = 2-part scopeKey)
    if (op === 'set' && !field) {
      const wrappedOp = entry.payload.value as {
        data: Record<string, unknown>
      }

      if (isTempId(entityId)) {
        // Store ADD data for merging with later per-field updates
        pendingAdds.set(entityKey, {
          entityType,
          entityId,
          data: wrappedOp.data
        })
      } else {
        // Non-temp ID with full set = UPDATE
        operations.push({
          type: PUSH_OPERATION_TYPE.UPDATE,
          entityType,
          entityId,
          data: wrappedOp.data
        })
      }
      continue
    }

    // Handle per-field UPDATE (op='set' with field = 3-part scopeKey)
    if (op === 'set' && field) {
      // Skip if this entity was deleted
      if (deletedEntities.has(entityKey)) {
        continue
      }

      // If there's a pending ADD for this temp entity, merge into it
      if (isTempId(entityId) && pendingAdds.has(entityKey)) {
        pendingAdds.get(entityKey)!.data[field] = entry.payload.value
        continue
      }

      // Otherwise, accumulate per-field updates
      const existing = fieldUpdates.get(entityKey)
      if (existing) {
        // Entries are newest-first: only set field if not already present
        if (!(field in existing.data)) {
          existing.data[field] = entry.payload.value
        }
      } else {
        fieldUpdates.set(entityKey, {
          entityType,
          entityId,
          data: { [field]: entry.payload.value }
        })
      }
      continue
    }

    // Handle PATCH (op='patch')
    if (op === 'patch') {
      // Skip if deleted
      if (deletedEntities.has(entityKey)) {
        continue
      }

      // For temp IDs with pending ADD, merge patch into ADD data
      if (isTempId(entityId) && pendingAdds.has(entityKey)) {
        Object.assign(
          pendingAdds.get(entityKey)!.data,
          entry.payload.value as Record<string, unknown>
        )
        continue
      }

      // Otherwise emit as UPDATE (or CREATE if temp ID)
      const operationType = isTempId(entityId)
        ? PUSH_OPERATION_TYPE.CREATE
        : PUSH_OPERATION_TYPE.UPDATE
      operations.push({
        type: operationType,
        entityType,
        entityId,
        data: entry.payload.value as Record<string, unknown>
      })
    }
  }

  // Emit merged ADD operations (with per-field updates already merged in)
  for (const [entityKey, { entityType, entityId, data }] of pendingAdds) {
    // Skip if deleted
    if (deletedEntities.has(entityKey)) {
      continue
    }
    // Only emit if we have data
    if (Object.keys(data).length > 0) {
      operations.push({
        type: PUSH_OPERATION_TYPE.CREATE,
        entityType,
        entityId,
        data
      })
    }
  }

  // Emit grouped UPDATE operations from field-level entries (filtering deleted entities)
  for (const [entityKey, { entityType, entityId, data }] of fieldUpdates) {
    // Skip if deleted
    if (deletedEntities.has(entityKey)) {
      continue
    }
    operations.push({
      type: PUSH_OPERATION_TYPE.UPDATE,
      entityType,
      entityId,
      data
    })
  }

  return operations
}

export const journalPushSource: PushSource = {
  async read(section: string): Promise<PushOperation[]> {
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
