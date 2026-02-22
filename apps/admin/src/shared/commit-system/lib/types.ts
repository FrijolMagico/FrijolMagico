import type { JournalEntity } from '@/shared/lib/database-entities'

export type SectionName = JournalEntity | 'evento'

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

// --- New contract types for commit-system decoupling ---

const COMMIT_OPERATION_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  RESTORE: 'RESTORE'
} as const

type CommitOperationType =
  (typeof COMMIT_OPERATION_TYPE)[keyof typeof COMMIT_OPERATION_TYPE]

interface CommitOperationCreate {
  type: typeof COMMIT_OPERATION_TYPE.CREATE
  entityType: string
  entityId: string
  data: Record<string, unknown>
}

interface CommitOperationUpdate {
  type: typeof COMMIT_OPERATION_TYPE.UPDATE
  entityType: string
  entityId: string
  data: Record<string, unknown>
}

interface CommitOperationDelete {
  type: typeof COMMIT_OPERATION_TYPE.DELETE
  entityType: string
  entityId: string
}

interface CommitOperationRestore {
  type: typeof COMMIT_OPERATION_TYPE.RESTORE
  entityType: string
  entityId: string
}

export type CommitOperation =
  | CommitOperationCreate
  | CommitOperationUpdate
  | CommitOperationDelete
  | CommitOperationRestore

export { COMMIT_OPERATION_TYPE }
export type { CommitOperationType }

export interface CommitSource {
  read(section: string): Promise<CommitOperation[]>
  hasPending(section: string): Promise<boolean>
  clear(section: string): Promise<void>
}

export type CommitExecutorFn = (
  operations: CommitOperation[]
) => Promise<CommitResult>

export interface CommitResult {
  success: boolean
  idMappings?: IdMapping[]
  errors?: CommitError[]
}

export interface CommitError {
  entityType: string
  entityId: string
  message: string
  code?: string
}

export interface CommitConfig {
  source: CommitSource
  executor: CommitExecutorFn
  section: string
  onSuccess?: () => void
}

export interface CommitProgress {
  phase: 'reading' | 'validating' | 'executing' | 'clearing'
  current?: number
  total?: number
}
