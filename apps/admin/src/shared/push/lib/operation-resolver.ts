import type { PushOperation } from './types'
import { isTempId } from './id-mapper'

export interface SortedPushOperations {
  deletes: PushOperation[]
  updates: PushOperation[]
  creates: PushOperation[]
  restores: PushOperation[]
}

export interface PushValidationResult {
  valid: boolean
  errors: string[]
}

export function sortPushOperations(
  operations: PushOperation[]
): PushOperation[] {
  const grouped = new Map<string, PushOperation[]>()
  for (const op of operations) {
    const key = `${op.entityType}:${op.entityId}`
    const group = grouped.get(key)
    if (group) group.push(op)
    else grouped.set(key, [op])
  }

  const deletes: PushOperation[] = []
  const restores: PushOperation[] = []
  const updates: PushOperation[] = []
  const creates: PushOperation[] = []

  for (const [, ops] of grouped) {
    const deleteIdx = ops.findIndex((op) => op.type === 'DELETE')
    const restoreIdx = ops.findIndex((op) => op.type === 'RESTORE')

    const hasDelete = deleteIdx !== -1
    const hasRestore = restoreIdx !== -1

    // If both exist, the one with the LOWER index is newer (ops are newest-first)
    const restoreIsNewer = hasRestore && hasDelete && restoreIdx < deleteIdx
    const deleteIsEffective = hasDelete && !restoreIsNewer

    const entityId = ops[0].entityId

    // Edge case A+B: DELETE on tempId — discard entirely (entity never persisted)
    if (deleteIsEffective && isTempId(entityId)) {
      continue // Skip — CREATE+DELETE cancellation or DELETE-on-tempId
    }

    // Edge case C+D: UPDATE + DELETE on real entity — DELETE wins, discard UPDATEs
    if (deleteIsEffective) {
      deletes.push(ops[deleteIdx])
      continue
    }

    // Normal processing for non-deleted entities
    for (const op of ops) {
      switch (op.type) {
        case 'RESTORE':
          // If there was a DELETE, RESTORE and DELETE cancel out — don't emit RESTORE
          if (!hasDelete) restores.push(op)
          break
        case 'UPDATE':
          updates.push(op)
          break
        case 'CREATE':
          creates.push(op)
          break
      }
    }
  }

  return [...deletes, ...restores, ...updates, ...creates]
}

/**
 * NOTE: This function is intentionally kept as a validation hook for future use.
 * Conflict resolution (DELETE+UPDATE, CREATE+DELETE, etc.) is handled silently
 * by sortPushOperations. This function is the right place to add hard validation
 * rules in the future — e.g. unknown entityType, missing required fields on CREATE,
 * permission checks — that should block the commit entirely instead of being resolved.
 */
export function validatePushOperations(
  _operations: PushOperation[] // eslint-disable-line @typescript-eslint/no-unused-vars
): PushValidationResult {
  const errors: string[] = []

  return {
    valid: errors.length === 0,
    errors
  }
}
