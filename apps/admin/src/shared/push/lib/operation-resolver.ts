import type { PushOperation } from './types'
import type { ZodSchema } from 'zod'
import { isTempId } from './id-mapper'
import {
  validateOperationData,
  shouldSkipValidation
} from './validators'

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
 * Validates push operations against Zod schemas.
 *
 * When validators are provided, validates operation data:
 * - Skips DELETE/RESTORE operations
 * - Uses partial validation for UPDATE operations
 * - Returns structural errors from schema validation
 *
 * @param operations - Array of push operations
 * @param validators - Optional map of entityType → ZodSchema
 * @returns PushValidationResult with any validation errors
 */
export function validatePushOperations(
  operations: PushOperation[],
  validators?: Record<string, ZodSchema>
): PushValidationResult {
  const errors: string[] = []

  if (!validators || Object.keys(validators).length === 0) {
    return { valid: true, errors }
  }

  for (const op of operations) {
    // Skip validation for DELETE/RESTORE (they don't have data to validate)
    if (shouldSkipValidation(op)) continue

    // After shouldSkipValidation, we know op has 'data' (CREATE or UPDATE)
    const schema = validators[op.entityType]
    if (!schema) continue // No validator for this entity type

    const isPartial = op.type === 'UPDATE'
    const validationResult = validateOperationData(
      (op as { data: Record<string, unknown> }).data,
      schema,
      isPartial
    )

    if (!validationResult.valid && validationResult.errors) {
      for (const error of validationResult.errors) {
        errors.push(
          `[${op.entityType}:${op.entityId}] ${error.field}: ${error.message}`
        )
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
