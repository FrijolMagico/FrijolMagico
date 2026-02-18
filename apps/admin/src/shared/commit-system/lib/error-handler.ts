import { z } from 'zod'

/**
 * Error types for persistence layer
 */

export interface ValidationError {
  type: 'VALIDATION_ERROR'
  message: string
  field?: string
  value?: unknown
}

export interface DatabaseError {
  type: 'DB_ERROR'
  message: string
}

export interface NetworkError {
  type: 'NETWORK_ERROR'
  message: string
}

export interface ConflictError {
  type: 'CONFLICT_ERROR'
  message: string
  field: string
  ourValue: unknown
  theirValue: unknown
}

export interface UnknownError {
  type: 'UNKNOWN_ERROR'
  message: string
}

export type PersistenceError =
  | ValidationError
  | DatabaseError
  | NetworkError
  | ConflictError
  | UnknownError

/**
 * Determine if error is user-facing (should display to UI)
 * - VALIDATION_ERROR: Show specific field error to help user fix
 * - CONFLICT_ERROR: Show field conflict to let user resolve
 * - DB_ERROR, NETWORK_ERROR: Show generic message (server problem)
 */
export function isUserFacingError(error: PersistenceError): boolean {
  return error.type === 'VALIDATION_ERROR' || error.type === 'CONFLICT_ERROR'
}

/**
 * Convert unknown error to PersistenceError
 * - Zod validation errors → ValidationError
 * - Database errors (constraint violations) → DatabaseError or ConflictError
 * - Network errors → NetworkError
 * - Unknown → UnknownError
 */
export function parsePersistenceError(error: unknown): PersistenceError {
  // Zod validation error
  if (error instanceof z.ZodError) {
    const issue = error.issues[0]
    return {
      type: 'VALIDATION_ERROR',
      message: issue.message,
      field: String(issue.path[0] || ''),
      value: undefined
    }
  }

  // Custom PersistenceError already typed
  if (isPersistenceError(error)) {
    return error
  }

  // Error with message (caught exceptions)
  if (error instanceof Error) {
    const message = error.message

    // Detect network errors
    if (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('ECONNREFUSED')
    ) {
      return {
        type: 'NETWORK_ERROR',
        message: 'No se pudo conectar con el servidor'
      }
    }

    // Detect database errors (but don't expose details)
    if (
      message.includes('database') ||
      message.includes('unique') ||
      message.includes('constraint') ||
      message.includes('UNIQUE constraint')
    ) {
      // For unique constraint violations, try to infer which field
      if (message.includes('unique')) {
        return {
          type: 'CONFLICT_ERROR',
          message: 'Este valor ya existe',
          field: 'unknown',
          ourValue: undefined,
          theirValue: undefined
        }
      }

      return {
        type: 'DB_ERROR',
        message: 'Error al guardar los datos'
      }
    }

    // Generic error message
    return {
      type: 'UNKNOWN_ERROR',
      message: 'Error inesperado'
    }
  }

  // Fallback for truly unknown errors
  return {
    type: 'UNKNOWN_ERROR',
    message: 'Error inesperado'
  }
}

/**
 * Type guard: check if error is PersistenceError
 */
function isPersistenceError(error: unknown): error is PersistenceError {
  if (typeof error !== 'object' || error === null) return false

  const e = error as Record<string, unknown>
  const validTypes = [
    'VALIDATION_ERROR',
    'DB_ERROR',
    'NETWORK_ERROR',
    'CONFLICT_ERROR',
    'UNKNOWN_ERROR'
  ]

  return (
    'type' in e &&
    'message' in e &&
    typeof e.type === 'string' &&
    typeof e.message === 'string' &&
    validTypes.includes(e.type)
  )
}

/**
 * Handle server action error and format for UI
 * Returns user-friendly message, retry flag, and error code
 */
export function handleServerActionError(error: unknown): {
  userMessage: string
  shouldRetry: boolean
  errorCode: string
} {
  const persistenceError = parsePersistenceError(error)

  // Log full error server-side for debugging
  logServerError(error, 'handleServerActionError')

  switch (persistenceError.type) {
    case 'VALIDATION_ERROR':
      return {
        userMessage: persistenceError.message || 'Datos inválidos',
        shouldRetry: false,
        errorCode: 'VALIDATION_ERROR'
      }

    case 'CONFLICT_ERROR':
      return {
        userMessage: `${persistenceError.field}: Este valor ya existe o hay un conflicto`,
        shouldRetry: false,
        errorCode: 'CONFLICT_ERROR'
      }

    case 'NETWORK_ERROR':
      return {
        userMessage: 'No se pudo conectar. Intenta de nuevo.',
        shouldRetry: true,
        errorCode: 'NETWORK_ERROR'
      }

    case 'DB_ERROR':
      return {
        userMessage: 'Error al guardar. Intenta de nuevo.',
        shouldRetry: true,
        errorCode: 'DB_ERROR'
      }

    case 'UNKNOWN_ERROR':
      return {
        userMessage: 'Algo salió mal. Intenta de nuevo más tarde.',
        shouldRetry: true,
        errorCode: 'UNKNOWN_ERROR'
      }

    default:
      const _exhaustiveCheck: never = persistenceError
      return _exhaustiveCheck
  }
}

/**
 * Log server-side error with context
 * Never expose technical details to client
 */
export function logServerError(error: unknown, context: string): void {
  const timestamp = new Date().toISOString()

  if (error instanceof Error) {
    console.error(`[${timestamp}] [RemotePersistence] ${context}:`, {
      message: error.message,
      stack: error.stack
    })
  } else if (typeof error === 'object' && error !== null) {
    console.error(`[${timestamp}] [RemotePersistence] ${context}:`, error)
  } else {
    console.error(
      `[${timestamp}] [RemotePersistence] ${context}:`,
      String(error)
    )
  }
}

/**
 * Create a DatabaseError from constraint violation
 * Useful for server actions catching DB errors
 */
export function createDatabaseError(message: string): DatabaseError {
  return {
    type: 'DB_ERROR',
    message: message || 'Error al guardar'
  }
}

/**
 * Create a ConflictError for unique constraint violations
 * field: which field has the conflict (e.g., 'email')
 */
export function createConflictError(
  field: string,
  ourValue: unknown,
  theirValue: unknown
): ConflictError {
  return {
    type: 'CONFLICT_ERROR',
    message: `${field} ya existe`,
    field,
    ourValue,
    theirValue
  }
}

/**
 * Create a ValidationError
 */
export function createValidationError(
  message: string,
  field?: string,
  value?: unknown
): ValidationError {
  return {
    type: 'VALIDATION_ERROR',
    message,
    field,
    value
  }
}
