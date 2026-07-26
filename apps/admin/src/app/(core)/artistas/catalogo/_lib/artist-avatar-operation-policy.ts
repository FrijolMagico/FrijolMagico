import type {
  UploadArtistAvatarData,
  UploadArtistAvatarInput
} from '../../_actions/upload-artist-avatar.action'
import type { AssetOperationPolicy } from '@/shared/assets-manager/client/asset-operation-contracts'
import type { AssetOperationRuntime } from '@/shared/assets-manager/client/asset-operation-runtime'
import { ASSET_TARGET } from '@/shared/assets-manager/client/contracts'
import type { ActionState } from '@/shared/types/actions'

interface UploadedAssetReference {
  path: string
  version: string
}

interface AssetFetch {
  (input: string, init: RequestInit): Promise<Response>
}

interface ArtistAvatarPersist {
  (input: UploadArtistAvatarInput): Promise<ActionState<UploadArtistAvatarData>>
}

interface ArtistAvatarPolicyDependencies {
  fetch: AssetFetch
  persist: ArtistAvatarPersist
}

/**
 * The lazy import preserves the server-action reference for Next.js, whose
 * bundler transforms `import()` calls to server actions. The `server-only`
 * guard is compile-time and stripped from server bundles; Bun's mock is a
 * test-environment limitation, not a production risk.
 */
async function persistArtistAvatar(
  input: UploadArtistAvatarInput
): Promise<ActionState<UploadArtistAvatarData>> {
  const { uploadArtistAvatarAction } =
    await import('../../_actions/upload-artist-avatar.action')
  return uploadArtistAvatarAction(input)
}

function isAssetReference(value: unknown): value is UploadedAssetReference {
  return (
    typeof value === 'object' &&
    value !== null &&
    'path' in value &&
    typeof value.path === 'string' &&
    value.path.length > 0 &&
    'version' in value &&
    typeof value.version === 'string' &&
    value.version.length > 0
  )
}

export function createArtistAvatarOperationPolicy(
  dependencies: ArtistAvatarPolicyDependencies
): AssetOperationPolicy<UploadedAssetReference, UploadArtistAvatarData, null> {
  return {
    async upload({ context, preparedAsset }) {
      const formData = new FormData()
      formData.append('assetTarget', ASSET_TARGET.ARTIST_AVATAR)
      formData.append('entityId', context.entityId)
      formData.append('blob', preparedAsset.blob, 'avatar.webp')
      formData.append('preparedWidth', String(preparedAsset.width))
      formData.append('preparedHeight', String(preparedAsset.height))

      const response = await dependencies.fetch('/api/assets', {
        method: 'POST',
        body: formData,
        signal: context.signal
      })
      if (!response.ok) throw new Error('Asset upload failed')

      const result: unknown = await response.json()
      if (!isAssetReference(result))
        throw new Error('Invalid asset upload response')
      return result
    },
    async persist({ context, upload }) {
      const result = await dependencies.persist({
        artistaId: Number(context.entityId),
        path: upload.path,
        version: upload.version
      })
      if (!result.success || !result.data)
        throw new Error(
          result.errors?.[0]?.message ?? 'Asset persistence failed'
        )
      return { persisted: result.data, cleanup: null }
    },
    async cleanup() {}
  }
}

export const artistAvatarPolicy = createArtistAvatarOperationPolicy({
  fetch: (input, init) => globalThis.fetch(input, init),
  persist: persistArtistAvatar
})

export function bootstrapArtistAvatarPolicy(
  runtime: AssetOperationRuntime
): void {
  runtime.ensure(ASSET_TARGET.ARTIST_AVATAR, artistAvatarPolicy)
}
