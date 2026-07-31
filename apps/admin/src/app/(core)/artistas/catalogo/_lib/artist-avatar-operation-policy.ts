import type { UploadArtistAvatarData } from '../../_actions/upload-artist-avatar.action'
import type { ExpectedActiveAvatar } from './avatar-history-contracts'
import type { AvatarActivationInput } from '../_hooks/use-avatar-controller'
import type {
  AssetEnqueueAdmissionInput,
  AssetOperationContext,
  AssetOperationPolicy
} from '@/shared/assets-manager/client/asset-operation-contracts'
import type { AssetOperationRuntime } from '@/shared/assets-manager/client/asset-operation-runtime'
import { ASSET_TARGET } from '@/shared/assets-manager/client/contracts'
import {
  ASSET_QUEUE_STATUS,
  type AssetQueueStatus
} from '@/shared/assets-manager/client/queue'

interface AssetFetch {
  (input: string, init: RequestInit): Promise<Response>
}

interface ArtistAvatarPolicyDependencies {
  fetch: AssetFetch
}

export interface ArtistAvatarUploadResult {
  receipt: string
}

function expectedActiveFromContext(
  context: AssetOperationContext
): ExpectedActiveAvatar | null | undefined {
  const input = context.input
  if (input === undefined) return undefined
  if (input === null) return null
  if (
    typeof input !== 'object' ||
    input === null ||
    !('id' in input) ||
    !('path' in input) ||
    !('version' in input) ||
    typeof input.id !== 'number' ||
    typeof input.path !== 'string' ||
    (typeof input.version !== 'string' && input.version !== null)
  )
    return undefined

  const { id, path, version } = input
  return { id, path, version }
}

function isPersistedAvatar(value: unknown): value is UploadArtistAvatarData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'artistaId' in value &&
    typeof value.artistaId === 'number' &&
    'path' in value &&
    typeof value.path === 'string' &&
    value.path.length > 0 &&
    'version' in value &&
    typeof value.version === 'string' &&
    value.version.length > 0
  )
}

function isUploadResult(value: unknown): value is ArtistAvatarUploadResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'receipt' in value &&
    typeof value.receipt === 'string' &&
    value.receipt.length > 0
  )
}

const TERMINAL_QUEUE_STATUSES: ReadonlySet<AssetQueueStatus> = new Set([
  ASSET_QUEUE_STATUS.COMPLETED,
  ASSET_QUEUE_STATUS.FAILED,
  ASSET_QUEUE_STATUS.CANCELLED
])

export function admitArtistAvatarEnqueue({
  target,
  entityId,
  snapshot
}: AssetEnqueueAdmissionInput): void {
  if (target !== ASSET_TARGET.ARTIST_AVATAR) return
  const existing = snapshot.jobs.some(
    (job) =>
      job.target === ASSET_TARGET.ARTIST_AVATAR &&
      job.entityId === entityId &&
      !TERMINAL_QUEUE_STATUSES.has(job.status)
  )
  if (existing)
    throw new Error('Avatar upload is already queued for this artist')
}

export function createArtistAvatarOperationPolicy(
  dependencies: ArtistAvatarPolicyDependencies
): AssetOperationPolicy<
  ArtistAvatarUploadResult,
  UploadArtistAvatarData,
  null
> {
  return {
    admitEnqueue: admitArtistAvatarEnqueue,
    async upload({ context, preparedAsset }) {
      const input = context.input as
        | ExpectedActiveAvatar
        | AvatarActivationInput
        | null
        | undefined
      const expectedActive =
        input && 'activation' in input
          ? undefined
          : expectedActiveFromContext(context)
      const formData = new FormData()
      formData.append('assetTarget', ASSET_TARGET.ARTIST_AVATAR)
      formData.append('entityId', context.entityId)
      formData.append('blob', preparedAsset.blob, 'avatar.webp')
      formData.append('preparedWidth', String(preparedAsset.width))
      formData.append('preparedHeight', String(preparedAsset.height))
      if (expectedActive === null) {
        formData.append('expectedActiveNone', 'true')
      } else if (expectedActive) {
        formData.append('expectedActiveId', String(expectedActive.id))
        formData.append('expectedActivePath', expectedActive.path)
        formData.append('expectedActiveVersion', expectedActive.version ?? '')
      }
      if (input && 'activation' in input) {
        formData.append('catalogId', String(input.activation.catalogId))
        formData.append(
          'requestedActive',
          String(input.activation.requestedActive)
        )
      }

      const response = await dependencies.fetch('/api/assets', {
        method: 'POST',
        body: formData,
        signal: context.signal
      })
      if (!response.ok) {
        const error: unknown = await response.json().catch(() => null)
        if (
          typeof error === 'object' &&
          error !== null &&
          'error' in error &&
          error.error === 'AVATAR_CONFLICT'
        )
          throw new Error('AVATAR_CONFLICT')
        throw new Error('Asset upload failed')
      }

      const result: unknown = await response.json()
      if (!isUploadResult(result))
        throw new Error('Invalid asset upload response')
      return result
    },
    async persist({ context, upload }) {
      const response = await dependencies.fetch('/api/assets/persist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ receipt: upload.receipt }),
        signal: context.signal
      })
      if (!response.ok) {
        const error: unknown = await response.json().catch(() => null)
        if (
          typeof error === 'object' &&
          error !== null &&
          'error' in error &&
          (error.error === 'AVATAR_CONFLICT' ||
            error.error === 'INVALID_RECEIPT')
        )
          throw new Error(error.error)
        throw new Error('Asset persistence failed')
      }
      const persisted: unknown = await response.json()
      if (!isPersistedAvatar(persisted))
        throw new Error('Invalid asset persistence response')
      return { persisted, cleanup: null }
    },
    async cleanup() {},
    async discardUpload({ context, upload }) {
      await dependencies.fetch('/api/assets/discard', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ receipt: upload.receipt }),
        signal: context.signal
      })
    }
  }
}

export const artistAvatarPolicy = createArtistAvatarOperationPolicy({
  fetch: (input, init) => globalThis.fetch(input, init)
})

export function bootstrapArtistAvatarPolicy(
  runtime: AssetOperationRuntime
): void {
  runtime.ensure(ASSET_TARGET.ARTIST_AVATAR, artistAvatarPolicy)
}
