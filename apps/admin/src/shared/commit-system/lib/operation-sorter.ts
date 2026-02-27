import type { CommitOperation } from './types'
import { isTempId } from './id-mapper'

export interface SortedCommitOperations {
  deletes: CommitOperation[]
  updates: CommitOperation[]
  creates: CommitOperation[]
  restores: CommitOperation[]
}

export interface CommitValidationResult {
  valid: boolean
  errors: string[]
}

export function sortCommitOperations(
  operations: CommitOperation[]
): CommitOperation[] {
  const grouped = new Map<string, CommitOperation[]>()
  for (const op of operations) {
    const key = `${op.entityType}:${op.entityId}`
    const group = grouped.get(key)
    if (group) group.push(op)
    else grouped.set(key, [op])
  }

  const deletes: CommitOperation[] = []
  const restores: CommitOperation[] = []
  const updates: CommitOperation[] = []
  const creates: CommitOperation[] = []

  for (const [, ops] of grouped) {
    const hasDelete = ops.some((op) => op.type === 'DELETE')

    const entityId = ops[0].entityId

    // Edge case A+B: DELETE on tempId — discard entirely (entity never persisted)
    if (hasDelete && isTempId(entityId)) {
      continue // Skip — CREATE+DELETE cancellation or DELETE-on-tempId
    }

    // Edge case C+D: UPDATE + DELETE on real entity — DELETE wins, discard UPDATEs
    if (hasDelete) {
      const deleteOp = ops.find((op) => op.type === 'DELETE')!
      deletes.push(deleteOp)
      continue
    }

    // Normal processing for non-deleted entities
    for (const op of ops) {
      switch (op.type) {
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
  }

  return [...deletes, ...restores, ...updates, ...creates]
}

export function validateCommitOperations(
  _operations: CommitOperation[] // eslint-disable-line @typescript-eslint/no-unused-vars
): CommitValidationResult {
  const errors: string[] = []

  return {
    valid: errors.length === 0,
    errors
  }
}
