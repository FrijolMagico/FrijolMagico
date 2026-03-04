import type { Entity } from '@/shared/lib/database-entities'
import type { ZodSchema } from 'zod'

export type SectionName = Entity | 'evento'

export interface IdMapping {
  tempId: string
  realId: number
  section: SectionName
}

export interface SaveResult {
  success: boolean
  error?: string
  errorCode?: 'VALIDATION_ERROR' | 'DB_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN'
  mappings?: IdMapping[]
  processedCount?: number
}

export interface BatchProgress {
  current: number
  total: number
  status: 'idle' | 'processing' | 'completed' | 'error'
}

export interface RemotePersistenceConfig {
  apiBaseUrl: string
  timeout: number
  retryAttempts: number
}

// --- New contract types for push decoupling ---

const PUSH_OPERATION_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  RESTORE: 'RESTORE'
} as const

type PushOperationType =
  (typeof PUSH_OPERATION_TYPE)[keyof typeof PUSH_OPERATION_TYPE]

interface PushOperationCreate {
  type: typeof PUSH_OPERATION_TYPE.CREATE
  entityType: string
  entityId: string
  data: Record<string, unknown>
}

interface PushOperationUpdate {
  type: typeof PUSH_OPERATION_TYPE.UPDATE
  entityType: string
  entityId: string
  data: Record<string, unknown>
}

interface PushOperationDelete {
  type: typeof PUSH_OPERATION_TYPE.DELETE
  entityType: string
  entityId: string
}

interface PushOperationRestore {
  type: typeof PUSH_OPERATION_TYPE.RESTORE
  entityType: string
  entityId: string
}

export type PushOperation =
  | PushOperationCreate
  | PushOperationUpdate
  | PushOperationDelete
  | PushOperationRestore

export { PUSH_OPERATION_TYPE }
export type { PushOperationType }

export interface PushSource {
  read(section: string | string[]): Promise<PushOperation[]>
  hasPending(section: string | string[]): Promise<boolean>
  clear(section: string | string[]): Promise<void>
}

export type PushExecutorFn = (
  operations: PushOperation[]
) => Promise<PushResult>

export interface PushResult {
  success: boolean
  idMappings?: IdMapping[]
  errors?: PushError[]
}

export interface PushError {
  entityType: string
  entityId: string
  message: string
  code?: string
}

export interface PushConfig {
  source: PushSource
  executor: PushExecutorFn
  section: string | string[]
  validators?: Record<string, ZodSchema>
  onSuccess?: () => void
}

export interface PushProgress {
  phase: 'reading' | 'validating' | 'executing' | 'clearing'
  current?: number
  total?: number
}
