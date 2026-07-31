import { describe, expect, mock, test } from 'bun:test'

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
  test('uploads a receipt, then persists it through the separate server boundary', async () => {
    const capture: {
      url: string
      body: BodyInit | null
      signal: AbortSignal | null | undefined
    } = {
      url: '',
      body: null,
      signal: null
    }
    const policy = createArtistAvatarOperationPolicy({
      fetch: async (input, init) => {
        capture.url = input
        capture.body = init.body ?? null
        capture.signal = init.signal
        if (input === '/api/assets')
          return Response.json({ receipt: 'receipt-1' })
        return Response.json({
          id: 1,
          artistaId: 42,
          path: 'artistas/artista-de-prueba/avatar-1710000000000.webp',
          version: '1710000000000',
          oldAsset: null
        })
      }
    })

    const upload = await policy.upload({ context, preparedAsset })
    const result = await policy.persist({ context, upload })

    expect(capture.url).toBe('/api/assets/persist')
    expect(capture.signal).toBe(context.signal)
    expect(capture.body).toBe(JSON.stringify({ receipt: 'receipt-1' }))
    const uploadPolicy = createArtistAvatarOperationPolicy({
      fetch: async (_input, init) => {
        const body = init.body as FormData
        const multipartBlob = body.get('blob')
        expect(body.get('assetTarget')).toBe('artist-avatar')
        expect(body.get('entityId')).toBe('42')
        expect(body.get('preparedWidth')).toBe('800')
        expect(body.get('preparedHeight')).toBe('800')
        expect(multipartBlob).toBeInstanceOf(Blob)
        expect(multipartBlob instanceof Blob ? multipartBlob.type : null).toBe(
          'image/webp'
        )
        return Response.json({ receipt: 'receipt-1' })
      }
    })
    const uploaded = await uploadPolicy.upload({ context, preparedAsset })
    const multipartBlob = preparedAsset.blob
    expect(multipartBlob).toBeInstanceOf(Blob)
    expect(multipartBlob instanceof Blob ? multipartBlob.type : null).toBe(
      'image/webp'
    )
    expect(multipartBlob instanceof Blob ? multipartBlob.size : null).toBe(
      preparedAsset.blob.size
    )
    expect(uploaded).toEqual({ receipt: 'receipt-1' })
    expect(result).toEqual({
      persisted: {
        id: 1,
        artistaId: 42,
        path: 'artistas/artista-de-prueba/avatar-1710000000000.webp',
        version: '1710000000000',
        oldAsset: null
      },
      cleanup: null
    })
  })

  test('sends the queued active-avatar baseline with the deferred upload', async () => {
    const expectedActive = {
      id: 8,
      path: 'artistas/artista-de-prueba/avatar-v1.webp',
      version: 'v1'
    }
    const capture: { body: FormData | null } = { body: null }
    const policy = createArtistAvatarOperationPolicy({
      fetch: async (_input, init) => {
        capture.body = init.body as FormData
        return Response.json({ receipt: 'receipt-2' })
      }
    })

    await policy.upload({
      context: { ...context, input: expectedActive },
      preparedAsset
    })

    expect(capture.body?.get('expectedActiveId')).toBe('8')
    expect(capture.body?.get('expectedActivePath')).toBe(expectedActive.path)
    expect(capture.body?.get('expectedActiveVersion')).toBe(
      expectedActive.version
    )
  })

  test('preserves a typed avatar conflict from the upload route', async () => {
    const policy = createArtistAvatarOperationPolicy({
      fetch: async () =>
        new Response(JSON.stringify({ error: 'AVATAR_CONFLICT' }), {
          status: 409,
          headers: { 'content-type': 'application/json' }
        })
    })

    await expect(
      policy.upload({
        context,
        preparedAsset
      })
    ).rejects.toThrow('AVATAR_CONFLICT')
  })

  test('rejects non-OK and malformed upload responses without persisting', async () => {
    const policy = createArtistAvatarOperationPolicy({
      fetch: async () => Response.json({ path: '' })
    })

    await expect(policy.upload({ context, preparedAsset })).rejects.toThrow(
      'Invalid asset upload response'
    )
    const unavailable = createArtistAvatarOperationPolicy({
      fetch: async () => new Response(null, { status: 503 })
    })
    await expect(
      unavailable.upload({ context, preparedAsset })
    ).rejects.toThrow('Asset upload failed')
  })

  test('treats the avatar-owned route response as the persisted result', async () => {
    const policy = createArtistAvatarOperationPolicy({
      fetch: async (input) =>
        input === '/api/assets'
          ? Response.json({ receipt: 'receipt-3' })
          : Response.json({
              id: 3,
              artistaId: 42,
              path: 'artistas/artista-de-prueba/avatar-1710000000000.webp',
              version: '1710000000000',
              oldAsset: null
            })
    })

    const upload = await policy.upload({ context, preparedAsset })
    const result = await policy.persist({ context, upload })

    expect(result).toEqual({
      persisted: {
        id: 3,
        artistaId: 42,
        path: 'artistas/artista-de-prueba/avatar-1710000000000.webp',
        version: '1710000000000',
        oldAsset: null
      },
      cleanup: null
    })
  })

  test('preserves typed receipt failures and best-effort discard at the persistence boundary', async () => {
    const requests: string[] = []
    const policy = createArtistAvatarOperationPolicy({
      fetch: async (input) => {
        requests.push(input)
        if (input === '/api/assets/persist')
          return Response.json({ error: 'INVALID_RECEIPT' }, { status: 400 })
        return new Response(null, { status: 503 })
      }
    })

    await expect(
      policy.persist({ context, upload: { receipt: 'receipt-discard' } })
    ).rejects.toThrow('INVALID_RECEIPT')
    await expect(
      policy.discardUpload?.({
        context,
        upload: { receipt: 'receipt-discard' }
      })
    ).resolves.toBeUndefined()
    expect(requests).toEqual(['/api/assets/persist', '/api/assets/discard'])
  })

  test('rejects a duplicate queued avatar for the same artist without blocking another artist', () => {
    const policy = createArtistAvatarOperationPolicy({
      fetch: async () => Response.json({})
    })
    const admitEnqueue = policy.admitEnqueue
    if (!admitEnqueue) throw new Error('Artist avatar admission is required')
    const snapshot = {
      activeJobId: 'job-1',
      jobs: [
        {
          jobId: 'job-1',
          target: ASSET_TARGET.ARTIST_AVATAR,
          entityId: '42',
          preparedAsset,
          preview: null,
          status: 'uploading' as const,
          sentBytes: 0,
          totalBytes: preparedAsset.blob.size,
          error: null,
          failedStep: null
        }
      ]
    }

    expect(() =>
      admitEnqueue({
        target: ASSET_TARGET.ARTIST_AVATAR,
        entityId: '42',
        snapshot
      })
    ).toThrow('Avatar upload is already queued for this artist')
    expect(() =>
      admitEnqueue({
        target: ASSET_TARGET.ARTIST_AVATAR,
        entityId: '43',
        snapshot
      })
    ).not.toThrow()
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
      uploadArtistAvatarAction: async () => ({ success: true })
    }))
    const fetchMock = async (input: RequestInfo | URL) => {
      const url = input.toString()
      events.push(url === '/api/assets' ? 'upload' : 'persist')
      return url === '/api/assets'
        ? Response.json({ receipt: 'receipt-shared' })
        : Response.json({
            id: 1,
            artistaId: 42,
            path: 'artistas/artista-de-prueba/avatar-1710000000000.webp',
            version: '1710000000000',
            oldAsset: null
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
