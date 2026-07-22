import type { AssetTarget } from './contracts'

export interface AssetOperationContext {
  jobId: string
  target: AssetTarget
  entityId: string
  correlationId: string
  signal: AbortSignal
  reportProgress: (sentBytes: number) => void
}

export type AssetOperationUploadResult<TUpload> = TUpload

export interface PersistInput<TUpload> {
  context: AssetOperationContext
  upload: TUpload
}

export type AssetOperationPersistInput<TUpload> = PersistInput<TUpload>

export interface AssetOperationPersistResult<TPersist, TCleanup> {
  persisted: TPersist
  cleanup: TCleanup
}

export interface AssetOperationCleanupInput<TCleanup> {
  context: AssetOperationContext
  value: TCleanup
}

export type AssetOperationCleanupResult = void

export interface AssetOperationPolicy<TUpload, TPersist, TCleanup> {
  upload: (
    context: AssetOperationContext
  ) => Promise<AssetOperationUploadResult<TUpload>>
  persist: (
    input: PersistInput<TUpload>
  ) => Promise<AssetOperationPersistResult<TPersist, TCleanup>>
  cleanup: (
    context: AssetOperationContext,
    value: TCleanup
  ) => Promise<AssetOperationCleanupResult>
}
