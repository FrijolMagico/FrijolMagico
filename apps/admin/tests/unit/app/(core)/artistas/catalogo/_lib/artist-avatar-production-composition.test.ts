import { describe, expect, mock, test } from 'bun:test'

import type { UploadArtistAvatarData } from '@/core/artistas/_actions/upload-artist-avatar.action'
import type { AssetOperationContext } from '@/shared/assets-manager/client/asset-operation-contracts'
import {
  createAssetOperationRuntime,
  getSharedAssetOperationRuntime
} from '@/shared/assets-manager/client/asset-operation-runtime'
import {
  ASSET_TARGET,
  type PreparedAsset
} from '@/shared/assets-manager/client/contracts'
import type { AssetCodec } from '@/shared/assets-manager/client/preparation'
import {
  createAssetQueue,
  type AssetQueueOperations
} from '@/shared/assets-manager/client/queue'

mock.module('server-only', () => ({}))

const { bootstrapArtistAvatarPolicy, createArtistAvatarOperationPolicy } =
  await import('@/core/artistas/catalogo/_lib/artist-avatar-operation-policy')

const preparedAsset: PreparedAsset = {
  blob: new Blob(['avatar'], { type: 'image/webp' }),
  width: 800,
  height: 800,
  mimeType: 'image/webp'
}

const context: AssetOperationContext = {
  jobId: 'job-1',
  target: ASSET_TARGET.ARTIST_AVATAR,
  entityId: '42',
  correlationId: 'correlation-1',
  signal: new AbortController().signal,
  reportProgress: () => {}
}

const codec: AssetCodec = {
  createPreview: () => 'blob:avatar',
  revokePreview: () => {},
  decode: async () => ({ width: 800, height: 800, close: () => {} }),
  encodeWebp: async () => preparedAsset.blob
}

function createRuntime() {
  const operations: AssetQueueOperations = {
    upload: async () => {},
    persist: async () => {}
  }
  const queue = createAssetQueue(() => 'job-1', operations, { baseDelay: 0 })
  return createAssetOperationRuntime(queue, (next) =>
    Object.assign(operations, next)
  )
}

describe('artist avatar production composition', () => {
  test('uploads exact multipart data before persisting the returned reference', async () => {
    const capture: {
      url: string
      body: FormData | null
      signal: AbortSignal | null | undefined
    } = {
      url: '',
      body: null,
      signal: null
    }
    const persisted: Array<{
      artistaId: number
      path: string
      version: string
    }> = []
    const policy = createArtistAvatarOperationPolicy({
      fetch: async (input, init) => {
        capture.url = input
        capture.body = init.body as FormData
        capture.signal = init.signal
        return Response.json({
          path: 'artist-avatar/42/v1.webp',
          version: 'v1'
        })
      },
      persist: async (input) => {
        persisted.push(input)
        return {
          success: true,
          data: {
            id: 1,
            artistaId: input.artistaId,
            path: input.path,
            version: input.version,
            oldAsset: { path: 'artist-avatar/42/old.webp', version: 'old' }
          } satisfies UploadArtistAvatarData
        }
      }
    })

    const upload = await policy.upload({ context, preparedAsset })
    const result = await policy.persist({ context, upload })

    expect(capture.url).toBe('/api/assets')
    expect(capture.signal).toBe(context.signal)
    expect(capture.body?.get('assetTarget')).toBe('artist-avatar')
    expect(capture.body?.get('entityId')).toBe('42')
    expect(capture.body?.get('preparedWidth')).toBe('800')
    expect(capture.body?.get('preparedHeight')).toBe('800')
    const multipartBlob = capture.body?.get('blob')
    expect(multipartBlob).toBeInstanceOf(Blob)
    expect(multipartBlob instanceof Blob ? multipartBlob.type : null).toBe(
      'image/webp'
    )
    expect(multipartBlob instanceof Blob ? multipartBlob.size : null).toBe(
      preparedAsset.blob.size
    )
    expect(persisted).toEqual([
      { artistaId: 42, path: 'artist-avatar/42/v1.webp', version: 'v1' }
    ])
    expect(result.cleanup).toBeNull()
  })

  test('rejects non-OK and malformed upload responses without persisting', async () => {
    const policy = createArtistAvatarOperationPolicy({
      fetch: async () => Response.json({ path: '' }),
      persist: async () => {
        throw new Error('persist must not run')
      }
    })

    await expect(policy.upload({ context, preparedAsset })).rejects.toThrow(
      'Invalid asset upload response'
    )
    const unavailable = createArtistAvatarOperationPolicy({
      fetch: async () => new Response(null, { status: 503 }),
      persist: async () => {
        throw new Error('persist must not run')
      }
    })
    await expect(
      unavailable.upload({ context, preparedAsset })
    ).rejects.toThrow('Asset upload failed')
  })

  test('bootstraps an injected runtime once while retaining the first policy', () => {
    const runtime = createRuntime()

    bootstrapArtistAvatarPolicy(runtime)
    bootstrapArtistAvatarPolicy(runtime)

    expect(() =>
      runtime.register(ASSET_TARGET.ARTIST_AVATAR, {
        upload: async () => ({ path: 'replacement', version: 'v2' }),
        persist: async () => ({ persisted: null, cleanup: null }),
        cleanup: async () => {}
      })
    ).toThrow(
      'Asset operation policy already registered for target: artist-avatar'
    )
  })

  test('composes the production policy at client module evaluation', async () => {
    const { ensureArtistAvatarPolicy } =
      await import('@/core/artistas/catalogo/_lib/artist-avatar-production-composition')
    const runtime = getSharedAssetOperationRuntime()

    ensureArtistAvatarPolicy()
    const policy = runtime.resolve(ASSET_TARGET.ARTIST_AVATAR)
    if (!policy) throw new Error('Artist avatar policy was not composed')

    runtime.ensure(ASSET_TARGET.ARTIST_AVATAR, policy)

    expect(typeof policy?.upload).toBe('function')
    expect(typeof policy?.persist).toBe('function')
    expect(typeof policy?.cleanup).toBe('function')
    expect(
      getSharedAssetOperationRuntime().resolve(ASSET_TARGET.ARTIST_AVATAR)
    ).toBe(policy)
  })

  test('uses the real shared composition through select, enqueue, upload, and persistence', async () => {
    const events: string[] = []
    const originalFetch = globalThis.fetch
    mock.module('@/core/artistas/_actions/upload-artist-avatar.action', () => ({
      uploadArtistAvatarAction: async () => {
        events.push('persist')
        return {
          success: true,
          data: {
            id: 1,
            artistaId: 42,
            path: 'artist-avatar/42/v1.webp',
            version: 'v1',
            oldAsset: null
          }
        }
      }
    }))
    const fetchMock = async () => {
      events.push('upload')
      return Response.json({
        path: 'artist-avatar/42/v1.webp',
        version: 'v1'
      })
    }
    fetchMock.preconnect = originalFetch.preconnect
    globalThis.fetch = fetchMock
    const { createAvatarController } =
      await import('@/core/artistas/catalogo/_hooks/use-avatar-controller')
    const controller = createAvatarController({ codec })

    try {
      await controller.selectFile(
        new File(['source'], 'avatar.png', { type: 'image/png' })
      )
      await controller.enqueue(42)
      await new Promise<void>((resolve) => {
        const unsubscribe = controller.subscribe(() => {
          if (controller.getSnapshot().phase !== 'completed') return
          unsubscribe()
          resolve()
        })
      })

      expect(events).toEqual(['upload', 'persist'])
      expect(controller.getSnapshot().job?.status).toBe('completed')
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
