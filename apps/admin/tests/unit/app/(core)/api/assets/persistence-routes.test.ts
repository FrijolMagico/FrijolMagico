import { beforeEach, describe, expect, mock, test } from 'bun:test'

import type { UploadArtistAvatarData } from '@/core/artistas/_actions/upload-artist-avatar.action'
import type { ActionState } from '@/shared/types/actions'

interface MockSession {
  user: { id: string }
}

type PersistResult = ActionState<UploadArtistAvatarData>
type DiscardResult = ActionState<null>

const getSession = mock(async (): Promise<MockSession | null> => ({
  user: { id: 'admin-1' }
}))
const requireAuth = mock(async (): Promise<MockSession | null> => ({
  user: { id: 'admin-1' }
}))
const getUser = mock(async () => ({ id: 'admin-1' }))
const persistArtistAvatarAction = mock(async (): Promise<PersistResult> => ({
  success: true,
  data: {
    id: 7,
    artistaId: 42,
    path: 'artistas/42/avatar-v1.webp',
    version: 'v1',
    oldAsset: null
  }
}))
const discardArtistAvatarAction = mock(async (): Promise<DiscardResult> => ({
  success: true,
  data: null
}))
const revalidateTag = mock(() => {})
const revalidateWebCacheBestEffort = mock(async () => {})
const revalidateWebCacheBatch = mock(
  async (): Promise<{ webRevalidation?: 'swr' | 'immediate' }> => ({})
)

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ revalidateTag }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCacheBatch,
  revalidateWebCacheBestEffort
}))
mock.module('@/shared/lib/auth/utils', () => ({
  getSession,
  requireAuth,
  getUser
}))
mock.module('@/core/artistas/_actions/persist-artist-avatar.action', () => ({
  persistArtistAvatarAction
}))
mock.module('@/core/artistas/_actions/discard-artist-avatar.action', () => ({
  discardArtistAvatarAction
}))

const { POST: persist } = await import('@/app/(core)/api/assets/persist/route')
const { POST: discard } = await import('@/app/(core)/api/assets/discard/route')

function request(path: string, receipt = 'receipt-1') {
  return new Request(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ receipt })
  })
}

describe('asset persistence routes', () => {
  beforeEach(() => {
    getSession.mockReset()
    getSession.mockResolvedValue({ user: { id: 'admin-1' } })
    persistArtistAvatarAction.mockReset()
    persistArtistAvatarAction.mockResolvedValue({
      success: true,
      data: {
        id: 7,
        artistaId: 42,
        path: 'artistas/42/avatar-v1.webp',
        version: 'v1',
        oldAsset: null
      }
    })
    discardArtistAvatarAction.mockReset()
    discardArtistAvatarAction.mockResolvedValue({ success: true, data: null })
    revalidateTag.mockClear()
    revalidateWebCacheBestEffort.mockClear()
    revalidateWebCacheBatch.mockReset()
    revalidateWebCacheBatch.mockResolvedValue({})
  })

  test('rejects unauthenticated persist and discard before calling actions', async () => {
    getSession.mockResolvedValue(null)

    expect((await persist(request('/api/assets/persist'))).status).toBe(401)
    expect((await discard(request('/api/assets/discard'))).status).toBe(401)
    expect(persistArtistAvatarAction).not.toHaveBeenCalled()
    expect(discardArtistAvatarAction).not.toHaveBeenCalled()
  })

  test('delegates an authenticated receipt to both boundaries', async () => {
    const persistResponse = await persist(request('/api/assets/persist'))
    const discardResponse = await discard(request('/api/assets/discard'))

    expect(persistArtistAvatarAction).toHaveBeenCalledWith({
      receipt: 'receipt-1'
    })
    expect(discardArtistAvatarAction).toHaveBeenCalledWith({
      receipt: 'receipt-1'
    })
    await expect(persistResponse.json()).resolves.toEqual({
      id: 7,
      artistaId: 42,
      path: 'artistas/42/avatar-v1.webp',
      version: 'v1',
      oldAsset: null
    })
    expect(discardResponse.status).toBe(204)
  })

  test('expires the base catalog and artist tags after a successful persistence response', async () => {
    const response = await persist(request('/api/assets/persist'))

    expect(response.status).toBe(200)
    expect(revalidateTag).toHaveBeenCalledWith('catalogo:artistas:base', {
      expire: 0
    })
    expect(revalidateTag).toHaveBeenCalledWith('catalogo:artistas', {
      expire: 0
    })
    expect(revalidateTag).toHaveBeenCalledWith('artistas', { expire: 0 })
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: 'catalogo:artistas:base' },
        { tag: 'catalogo:artistas' }
      ],
      'assets-persist'
    )
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
  })

  test('preserves action-only SWR metadata when the API batch has no summary', async () => {
    persistArtistAvatarAction.mockResolvedValueOnce({
      success: true,
      data: {
        id: 7,
        artistaId: 42,
        path: 'artistas/42/avatar-v1.webp',
        version: 'v1',
        oldAsset: null
      },
      webRevalidation: 'swr'
    })

    const response = await persist(request('/api/assets/persist'))

    await expect(response.json()).resolves.toEqual({
      id: 7,
      artistaId: 42,
      path: 'artistas/42/avatar-v1.webp',
      version: 'v1',
      oldAsset: null,
      webRevalidation: 'swr'
    })
  })

  test('preserves immediate metadata when neither executed branch requests SWR', async () => {
    persistArtistAvatarAction.mockResolvedValueOnce({
      success: true,
      data: {
        id: 7,
        artistaId: 42,
        path: 'artistas/42/avatar-v1.webp',
        version: 'v1',
        oldAsset: null
      },
      webRevalidation: 'immediate'
    })

    const response = await persist(request('/api/assets/persist'))

    await expect(response.json()).resolves.toMatchObject({
      id: 7,
      webRevalidation: 'immediate'
    })
  })

  test('prefers SWR when action and API batch summaries disagree', async () => {
    persistArtistAvatarAction.mockResolvedValueOnce({
      success: true,
      data: {
        id: 7,
        artistaId: 42,
        path: 'artistas/42/avatar-v1.webp',
        version: 'v1',
        oldAsset: null
      },
      webRevalidation: 'immediate'
    })
    revalidateWebCacheBatch.mockResolvedValueOnce({ webRevalidation: 'swr' })

    const response = await persist(request('/api/assets/persist'))

    await expect(response.json()).resolves.toMatchObject({
      id: 7,
      artistaId: 42,
      webRevalidation: 'swr'
    })
  })

  test('awaits the API batch before returning persistence data', async () => {
    let completeBatch: (summary: {}) => void = () => {}
    let startBatch: () => void = () => {}
    const batchStarted = new Promise<void>((resolve) => (startBatch = resolve))
    revalidateWebCacheBatch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          completeBatch = resolve
          startBatch()
        })
    )
    let responseSettled = false
    const responsePromise = persist(request('/api/assets/persist')).then(
      (response) => {
        responseSettled = true
        return response
      }
    )

    await batchStarted
    expect(responseSettled).toBe(false)
    completeBatch({})
    const response = await responsePromise
    expect(response.status).toBe(200)
  })

  test('keeps the committed persistence response when tag invalidation fails', async () => {
    const consoleError = mock(() => {})
    const originalError = console.error
    console.error = consoleError as never
    revalidateTag.mockImplementationOnce(() => {
      throw new Error('cache unavailable')
    })

    const response = await persist(request('/api/assets/persist'))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ id: 7 })
    expect(revalidateTag).toHaveBeenCalledWith('catalogo:artistas', {
      expire: 0
    })
    expect(revalidateTag).toHaveBeenCalledWith('artistas', { expire: 0 })
    expect(consoleError).toHaveBeenCalledWith(
      '[assets/persist] Cache invalidation failed',
      expect.any(Error)
    )
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [
        { tag: 'catalogo:artistas:base' },
        { tag: 'catalogo:artistas' }
      ],
      'assets-persist'
    )
    console.error = originalError
  })

  test('preserves typed receipt and conflict failures from persistence', async () => {
    persistArtistAvatarAction.mockResolvedValueOnce({
      success: false,
      errors: [{ entityType: 'INVALID_RECEIPT', message: 'INVALID_RECEIPT' }]
    })
    discardArtistAvatarAction.mockResolvedValueOnce({
      success: false,
      errors: [{ entityType: 'artist-avatar', message: 'discard failed' }]
    })

    const persistResponse = await persist(request('/api/assets/persist'))
    const discardResponse = await discard(request('/api/assets/discard'))

    expect(persistResponse.status).toBe(400)
    expect(revalidateTag).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    await expect(persistResponse.json()).resolves.toEqual({
      error: 'INVALID_RECEIPT'
    })
    expect(discardResponse.status).toBe(400)
  })
})
