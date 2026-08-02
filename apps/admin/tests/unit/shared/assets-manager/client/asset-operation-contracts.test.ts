import { expect, test } from 'bun:test'

import { ASSET_TARGET } from '../../../../../src/shared/assets-manager/client/contracts'
import { createAssetOperationIdentity } from '../../../../../src/shared/assets-manager/client/asset-operation-identity'
import { createAssetOperationPolicyRegistry } from '../../../../../src/shared/assets-manager/client/asset-operation-policy-registry'
import type {
  AssetOperationCleanupInput,
  AssetOperationContext,
  AssetOperationPersistResult,
  AssetOperationPolicy,
  AssetOperationUploadInput,
  PersistInput
} from '../../../../../src/shared/assets-manager/client/asset-operation-contracts'
import type { PreparedAsset } from '../../../../../src/shared/assets-manager/client/contracts'

interface AvatarUpload {
  path: string
  bytes: number
}

interface AvatarPersisted {
  assetId: string
}

interface AvatarCleanup {
  path: string
}

interface PosterUpload {
  path: string
  bytes: number
}

interface PosterPersisted {
  referenceId: string
}

interface PosterCleanup {
  path: string
  version: number
}

const context: AssetOperationContext = {
  jobId: 'job-1',
  target: ASSET_TARGET.ARTIST_AVATAR,
  entityId: 'entity-1',
  correlationId: 'correlation-1',
  signal: new AbortController().signal,
  reportProgress: () => {}
}

const preparedAsset: PreparedAsset = {
  blob: new Blob(['prepared-avatar'], { type: 'image/webp' }),
  width: 800,
  height: 800,
  mimeType: 'image/webp'
}

let cleanedAvatarPath = ''

const avatarPolicy = {
  upload: async (input: AssetOperationUploadInput): Promise<AvatarUpload> => ({
    path: `avatars/${input.context.entityId}.webp`,
    bytes: input.preparedAsset.blob.size
  }),
  persist: async (
    input: PersistInput<AvatarUpload>
  ): Promise<AssetOperationPersistResult<AvatarPersisted, AvatarCleanup>> => ({
    persisted: { assetId: input.upload.path },
    cleanup: { path: input.upload.path }
  }),
  cleanup: async (
    input: AssetOperationCleanupInput<AvatarCleanup>
  ): Promise<void> => {
    cleanedAvatarPath = input.value.path
  }
} satisfies AssetOperationPolicy<AvatarUpload, AvatarPersisted, AvatarCleanup>

const posterPolicy = {
  upload: async (input: AssetOperationUploadInput): Promise<PosterUpload> => ({
    path: `posters/${input.context.entityId}-v2.webp`,
    bytes: input.preparedAsset.blob.size
  }),
  persist: async (
    input: PersistInput<PosterUpload>
  ): Promise<AssetOperationPersistResult<PosterPersisted, PosterCleanup>> => ({
    persisted: { referenceId: input.upload.path },
    cleanup: { path: input.upload.path, version: 2 }
  }),
  cleanup: async (
    _input: AssetOperationCleanupInput<PosterCleanup>
  ): Promise<void> => {}
} satisfies AssetOperationPolicy<PosterUpload, PosterPersisted, PosterCleanup>

test('keeps missing target policies unresolved', () => {
  const registry = createAssetOperationPolicyRegistry()

  expect(registry.resolve(ASSET_TARGET.ARTIST_AVATAR)).toBeUndefined()
})

test('registers and resolves independent policies for two targets', () => {
  const registry = createAssetOperationPolicyRegistry()

  registry.register(ASSET_TARGET.ARTIST_AVATAR, avatarPolicy)
  registry.register(ASSET_TARGET.EDITION_POSTER, posterPolicy)

  expect(
    registry.resolve<AvatarUpload, AvatarPersisted, AvatarCleanup>(
      ASSET_TARGET.ARTIST_AVATAR
    )
  ).toBe(avatarPolicy)
  expect(
    registry.resolve<PosterUpload, PosterPersisted, PosterCleanup>(
      ASSET_TARGET.EDITION_POSTER
    )
  ).toBe(posterPolicy)
})

test('rejects duplicate registration without replacing the original policy', () => {
  const registry = createAssetOperationPolicyRegistry()

  registry.register(ASSET_TARGET.ARTIST_AVATAR, avatarPolicy)

  expect(() =>
    registry.register(ASSET_TARGET.ARTIST_AVATAR, posterPolicy)
  ).toThrow(
    'Asset operation policy already registered for target: artist-avatar'
  )
  expect(
    registry.resolve<AvatarUpload, AvatarPersisted, AvatarCleanup>(
      ASSET_TARGET.ARTIST_AVATAR
    )
  ).toBe(avatarPolicy)
})

test('ensures the first policy without weakening duplicate registration errors', () => {
  const registry = createAssetOperationPolicyRegistry()

  registry.ensure(ASSET_TARGET.ARTIST_AVATAR, avatarPolicy)
  registry.ensure(ASSET_TARGET.ARTIST_AVATAR, posterPolicy)

  expect(
    registry.resolve<AvatarUpload, AvatarPersisted, AvatarCleanup>(
      ASSET_TARGET.ARTIST_AVATAR
    )
  ).toBe(avatarPolicy)
  expect(() =>
    registry.register(ASSET_TARGET.ARTIST_AVATAR, posterPolicy)
  ).toThrow(
    'Asset operation policy already registered for target: artist-avatar'
  )
})

test('preserves the public entity ID while separating same-entity targets', () => {
  const avatarIdentity = createAssetOperationIdentity(
    ASSET_TARGET.ARTIST_AVATAR,
    'entity-1'
  )
  const posterIdentity = createAssetOperationIdentity(
    ASSET_TARGET.EDITION_POSTER,
    'entity-1'
  )

  expect(avatarIdentity.domainEntityId).toBe('entity-1')
  expect(posterIdentity.domainEntityId).toBe('entity-1')
  expect(avatarIdentity.queueEntityId).toBe('artist-avatar\u0000entity-1')
  expect(posterIdentity.queueEntityId).toBe('edition-poster\u0000entity-1')
  expect(avatarIdentity.queueEntityId).not.toBe(posterIdentity.queueEntityId)
})

test('creates a stable identity for the same target and entity', () => {
  const first = createAssetOperationIdentity(
    ASSET_TARGET.ARTIST_AVATAR,
    'entity-1'
  )
  const second = createAssetOperationIdentity(
    ASSET_TARGET.ARTIST_AVATAR,
    'entity-1'
  )

  expect(second).toEqual(first)
})

test('keeps different entities distinct within one target', () => {
  const first = createAssetOperationIdentity(
    ASSET_TARGET.EDITION_POSTER,
    'entity-1'
  )
  const second = createAssetOperationIdentity(
    ASSET_TARGET.EDITION_POSTER,
    'entity-2'
  )

  expect(first.queueEntityId).not.toBe(second.queueEntityId)
  expect(first.domainEntityId).not.toBe(second.domainEntityId)
})

test('keeps the typed persistence result tied to upload and cleanup values', () => {
  const result: AssetOperationPersistResult<AvatarPersisted, AvatarCleanup> = {
    persisted: { assetId: 'asset-1' },
    cleanup: { path: 'avatars/entity-1.webp' }
  }

  expect(result.persisted.assetId).toBe('asset-1')
  expect(result.cleanup.path).toBe('avatars/entity-1.webp')
  expect(context.signal).toBeInstanceOf(AbortSignal)
})

test('passes prepared assets to upload and cleanup inputs to policy hooks', async () => {
  const upload = await avatarPolicy.upload({ context, preparedAsset })

  expect(upload.path).toBe('avatars/entity-1.webp')
  expect(upload.bytes).toBe(preparedAsset.blob.size)

  await avatarPolicy.cleanup({
    context,
    value: { path: upload.path }
  })

  expect(cleanedAvatarPath).toBe(upload.path)
})

test('passes a different prepared asset through the poster policy input', async () => {
  const posterContext: AssetOperationContext = {
    ...context,
    target: ASSET_TARGET.EDITION_POSTER,
    entityId: 'entity-2'
  }
  const posterAsset: PreparedAsset = {
    blob: new Blob(['prepared-poster'], { type: 'image/webp' }),
    width: 800,
    height: 600,
    mimeType: 'image/webp'
  }

  const upload = await posterPolicy.upload({
    context: posterContext,
    preparedAsset: posterAsset
  })

  expect(upload.path).toBe('posters/entity-2-v2.webp')
  expect(upload.bytes).toBe(posterAsset.blob.size)
})
