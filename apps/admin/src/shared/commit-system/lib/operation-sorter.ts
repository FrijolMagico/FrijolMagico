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
import type { CommitOperation } from './types'

/**
 * Sorted journal operations organized by type
 */
export interface SortedOperations {
  deletes: JournalEntry[]
  updates: JournalEntry[]
  creates: JournalEntry[]
  restores: JournalEntry[]
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
  const restores: JournalEntry[] = []

  for (const entry of entries) {
    if (entry.payload.op === 'unset') {
      deletes.push(entry)
    } else if (entry.payload.op === 'restore') {
      restores.push(entry)
    } else if (entry.payload.op === 'patch') {
      updates.push(entry)
    } else if (entry.payload.op === 'set') {
      updates.push(entry)
    }
  }

  return { deletes, updates, creates, restores }
}

const NET_STATE = {
  ACTIVE: 'active',
  DELETED: 'deleted'
} as const

type NetState = (typeof NET_STATE)[keyof typeof NET_STATE]

/**
 * Validate operations using temporal reduction.
 *
 * Groups entries by entity ID, sorts each group by timestamp, and walks
 * chronologically to compute a netState (active vs deleted). A contradiction
 * is flagged only when a set/patch targets an entity whose netState is 'deleted'.
 */
export function validateOperations(entries: JournalEntry[]): ValidationResult {
  const errors: string[] = []

  const entriesByEntity = new Map<string, JournalEntry[]>()

  for (const entry of entries) {
    const entityId = extractEntityId(entry.scopeKey)
    const group = entriesByEntity.get(entityId)
    if (group) {
      group.push(entry)
    } else {
      entriesByEntity.set(entityId, [entry])
    }
  }

  for (const [entityId, entityEntries] of entriesByEntity) {
    const sorted = entityEntries.toSorted(
      (a, b) => a.timestampMs - b.timestampMs
    )

    let netState: NetState | undefined

    for (const entry of sorted) {
      const { op } = entry.payload

      if (op === 'unset') {
        netState = NET_STATE.DELETED
      } else if (op === 'restore') {
        netState = NET_STATE.ACTIVE
      } else if (op === 'set' || op === 'patch') {
        if (netState === NET_STATE.DELETED) {
          errors.push(
            `Contradictory operations: entity "${entityId}" is deleted but also modified`
          )
          break
        }
        netState = NET_STATE.ACTIVE
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}






/**
 * Sorted commit operations organized by type
 */
export interface SortedCommitOperations {
  deletes: CommitOperation[]
  updates: CommitOperation[]
  creates: CommitOperation[]
  restores: CommitOperation[]
}

/**
 * Validation result for commit operation consistency
 */
export interface CommitValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Sort CommitOperation[] for database execution
 *
 * Order: DELETE → RESTORE → UPDATE → CREATE
 * - DELETEs first to free up FK constraints
 * - RESTOREs next to re-enable soft-deleted entities
 * - UPDATEs to modify existing entities
 * - CREATEs last so FK references exist
 */
export function sortCommitOperations(
  operations: CommitOperation[]
): CommitOperation[] {
  const deletes: CommitOperation[] = []
  const restores: CommitOperation[] = []
  const updates: CommitOperation[] = []
  const creates: CommitOperation[] = []

  for (const op of operations) {
    switch (op.type) {
      case 'DELETE':
        deletes.push(op)
        break
      case 'RESTORE':
        restores.push(op)
        break
      case 'UPDATE':
        updates.push(op)
        break
      case 'CREATE':
        creates.push(op)
        break
    }
  }

  return [...deletes, ...restores, ...updates, ...creates]
}

/**
 * Validate CommitOperation[] using temporal reduction
 *
 * Groups operations by entityId, sorts each group by timestamp (if available),
 * and detects contradictory operations (e.g., DELETE followed by UPDATE on same entity).
 */
export function validateCommitOperations(
  operations: CommitOperation[]
): CommitValidationResult {
  const errors: string[] = []

  const opsByEntity = new Map<string, CommitOperation[]>()

  for (const op of operations) {
    const key = `${op.entityType}:${op.entityId}`
    const group = opsByEntity.get(key)
    if (group) {
      group.push(op)
    } else {
      opsByEntity.set(key, [op])
    }
  }

  const STATE = {
    ACTIVE: 'active',
    DELETED: 'deleted'
  } as const

  type EntityState = (typeof STATE)[keyof typeof STATE]

  for (const [entityKey, entityOps] of opsByEntity) {
    let netState: EntityState | undefined

    for (const op of entityOps) {
      switch (op.type) {
        case 'DELETE':
          netState = STATE.DELETED
          break
        case 'RESTORE':
          netState = STATE.ACTIVE
          break
        case 'UPDATE':
        case 'CREATE':
          if (netState === STATE.DELETED) {
            errors.push(
              `Contradictory operations: entity "${entityKey}" is deleted but also modified`
            )
          }
          netState = STATE.ACTIVE
          break
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}