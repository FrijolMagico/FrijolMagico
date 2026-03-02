import type { ZodSchema, ZodRawShape } from 'zod'
import { ZodError, ZodObject } from 'zod'
import { nullsToUndefined } from '@/shared/lib/utils'
import type { PushOperation } from './types'

export interface FieldError {
  field: string
  message: string
}

export interface ValidationResult<T = unknown> {
  valid: boolean
  data?: T
  errors?: FieldError[]
}

/**
 * Validates operation data against a Zod schema.
 *
 * Handles:
 * - Strips `id` field (server-assigned)
 * - Converts null → undefined (UI form behavior)
 * - Skips validation for DELETE/RESTORE operations
 * - Supports partial validation for UPDATE operations
 *
 * @param data - Raw operation data (may contain null values)
 * @param schema - Zod schema for validation
 * @param isPartial - If true, uses schema.partial() for UPDATE operations
 * @returns ValidationResult with validated data or field-level errors
 */
export function validateOperationData<T>(
  data: Record<string, unknown>,
  schema: ZodSchema<T>,
  isPartial: boolean
): ValidationResult<T> {
  try {
    // Strip id field (server-assigned, not validated)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...cleanData } = data

    // Convert null → undefined for optional fields
    const normalizedData = nullsToUndefined(cleanData)

    // Validate against schema
    let validatedData: T
    if (isPartial && schema instanceof ZodObject) {
      validatedData = (schema as ZodObject<ZodRawShape>).partial().parse(normalizedData) as T
    } else {
      validatedData = schema.parse(normalizedData)
    }

    return {
      valid: true,
      data: validatedData
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: FieldError[] = error.issues.map((issue) => ({
        field: issue.path.join('.') || 'root',
        message: issue.message
      }))

      return {
        valid: false,
        errors
      }
    }

    // Fallback for non-Zod errors
    return {
      valid: false,
      errors: [
        {
          field: 'root',
          message:
            error instanceof Error ? error.message : 'Unknown validation error'
        }
      ]
    }
  }
}

/**
 * Determines if an operation should skip validation.
 * DELETE and RESTORE operations don't need data validation.
 *
 * @param operation - Push operation to check
 * @returns true if validation should be skipped
 */
export function shouldSkipValidation(operation: PushOperation): boolean {
  return operation.type === 'DELETE' || operation.type === 'RESTORE'
}
