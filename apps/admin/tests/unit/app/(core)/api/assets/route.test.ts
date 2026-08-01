import { beforeEach, describe, it, expect, mock } from 'bun:test'

mock.module('server-only', () => ({}))

interface MockSession {
  user: { id: string }
}

const mockGetSession = mock(async (): Promise<MockSession | null> => null)
const mockRequireAuth = mock(async (): Promise<MockSession | null> => null)
const mockGetUser = mock(async (): Promise<MockSession['user'] | null> => null)
const mockUploadArtistAvatarAction = mock(async () => ({
  success: true,
  data: {
    id: 7,
    artistaId: 42,
    path: 'artistas/artista-de-prueba/avatar-1710000000000.webp',
    version: '1710000000000',
    oldAsset: null
  }
}))

mock.module('@/shared/lib/auth/utils', () => ({
  getSession: mockGetSession,
  requireAuth: mockRequireAuth,
  getUser: mockGetUser
}))

mock.module('@/core/artistas/_actions/upload-artist-avatar.action', () => ({
  uploadArtistAvatarAction: mockUploadArtistAvatarAction
}))

describe('POST /api/assets', () => {
  beforeEach(() => {
    mockUploadArtistAvatarAction.mockClear()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null)

    const { POST } = await import('@/app/(core)/api/assets/route')
    const request = new Request('http://localhost/api/assets', {
      method: 'POST'
    })
    const response = await POST(request)

    expect(response.status).toBe(401)
  })

  it('returns 400 when payload is invalid', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: '1' } })

    const { POST } = await import('@/app/(core)/api/assets/route')
    const request = new Request('http://localhost/api/assets', {
      method: 'POST',
      headers: { 'content-length': '100' }
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('delegates an artist avatar upload using only prepared client input', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: '1' } })
    const formData = new FormData()
    const blob = new Blob(['fake-webp'], { type: 'image/webp' })
    formData.append('assetTarget', 'artist-avatar')
    formData.append('entityId', '42')
    formData.append('slug', 'artista-de-prueba')
    formData.append('blob', blob)
    formData.append('preparedWidth', '800')
    formData.append('preparedHeight', '800')
    formData.append('path', 'untrusted/path.webp')
    formData.append('version', 'untrusted-version')

    const { POST } = await import('@/app/(core)/api/assets/route')
    const response = await POST(
      new Request('http://localhost/api/assets', {
        method: 'POST',
        body: formData
      })
    )

    expect(response.status).toBe(200)
    expect(mockUploadArtistAvatarAction).toHaveBeenCalledWith({
      artistaId: 42,
      slug: 'artista-de-prueba',
      blob: expect.any(Blob),
      width: 800,
      height: 800,
        expectedActive: undefined
    })
    await expect(response.json()).resolves.toEqual({
      id: 7,
      artistaId: 42,
      path: 'artistas/artista-de-prueba/avatar-1710000000000.webp',
      version: '1710000000000',
      oldAsset: null
    })
  })
})
