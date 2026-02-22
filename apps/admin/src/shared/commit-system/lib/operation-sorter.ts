import type { CommitOperation } from './types'

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
