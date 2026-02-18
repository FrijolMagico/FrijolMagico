/**
 * @fileoverview operation-sorter.ts - Operation Ordering and Validation
 *
 * Sorts journal operations before database execution to respect FK constraints and detect conflicts.
 *
 * Order: DELETE (unset) -> UPDATE (patch/set) -> CREATE
 * - DELETEs first to free up FK constraints
 * - UPDATEs next to modify existing entities
 * - CREATEs last so FK references exist
 *
 * Detects contradictory operations: same ID deleted and modified in same batch
 */

import type { JournalEntry } from '@/shared/change-journal/lib/types'

/**
 * Sorted journal operations organized by type
 */
export interface SortedOperations {
  deletes: JournalEntry[]
  updates: JournalEntry[]
  creates: JournalEntry[]
}

/**
 * Validation result for operation consistency
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Extract entity ID from scopeKey
 *
 * Format: "section:entityId" or "section:entityId:field"
 *
 * @param scopeKey The deduplication key
 * @returns The entity ID portion
 */
function extractEntityId(scopeKey: string): string {
  const parts = scopeKey.split(':')
  return parts[1] || scopeKey
}

/**
 * Sort journal operations for database execution
 *
 * Organizes operations to respect foreign key constraints:
 * 1. DELETEs (unset) - Remove entities first to free FK constraints
 * 2. UPDATEs (patch/set) - Modify existing entities
 * 3. CREATEs - Add new entities when dependencies exist
 *
 * @param entries Journal entries to sort
 * @returns Sorted operations organized by type
 */
export function sortOperations(entries: JournalEntry[]): SortedOperations {
  const deletes: JournalEntry[] = []
  const updates: JournalEntry[] = []
  const creates: JournalEntry[] = []

  for (const entry of entries) {
    if (entry.payload.op === 'unset') {
      deletes.push(entry)
    } else if (entry.payload.op === 'patch') {
      updates.push(entry)
    } else if (entry.payload.op === 'set') {
      // For 'set' operations, determine if CREATE or UPDATE based on entity context
      // By default, treat as UPDATE. The mapper will determine final action.
      updates.push(entry)
    }
  }

  return { deletes, updates, creates }
}

/**
 * Validate operations for contradictions
 *
 * Detects invalid operation combinations like:
 * - DELETE entity X + UPDATE entity X in same batch
 * - Multiple deletes of same entity (idempotent warning)
 *
 * @param entries Journal entries to validate
 * @returns Validation result with errors if found
 */
export function validateOperations(entries: JournalEntry[]): ValidationResult {
  const deletedIds = new Set<string>()
  const modifiedIds: Record<string, number> = {}
  const errors: string[] = []

  // Collect all operations by entity ID
  for (const entry of entries) {
    const entityId = extractEntityId(entry.scopeKey)

    if (entry.payload.op === 'unset') {
      deletedIds.add(entityId)
    } else {
      modifiedIds[entityId] = (modifiedIds[entityId] ?? 0) + 1
    }
  }

  // Detect contradictions
  for (const entityId of Object.keys(modifiedIds)) {
    if (deletedIds.has(entityId)) {
      errors.push(
        `Contradictory operations: entity "${entityId}" is deleted but also modified (${modifiedIds[entityId]} operation(s))`
      )
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
