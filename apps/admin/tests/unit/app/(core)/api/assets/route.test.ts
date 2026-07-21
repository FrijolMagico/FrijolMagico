import { describe, it, expect, mock } from 'bun:test'

mock.module('server-only', () => ({}))

const mockGetSession = mock(async () => null)
const mockUploadAsset = mock(async () => ({ path: 'artist-avatar/abc/ver.webp', version: 'ver' }))
const mockReplaceAsset = mock(async () => ({ path: 'artist-avatar/abc/ver2.webp', version: 'ver2' }))
const mockDeleteAsset = mock(async () => {})

mock.module('@/shared/lib/auth/utils', () => ({
  getSession: mockGetSession,
}))

mock.module('@/shared/assets-manager/server/r2-adapter', () => ({
  R2Adapter: mock(() => ({
    uploadAsset: mockUploadAsset,
    replaceAsset: mockReplaceAsset,
    deleteAsset: mockDeleteAsset,
  })),
  createR2Config: mock(() => ({
    endpoint: 'https://mock.r2.dev',
    bucketName: 'test-bucket',
    accessKeyId: 'test-key',
    secretAccessKey: 'test-secret',
  })),
}))

describe('POST /api/assets', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null)

    const { POST } = await import('@/app/(core)/api/assets/route')
    const request = new Request('http://localhost/api/assets', { method: 'POST' })
    const response = await POST(request)

    expect(response.status).toBe(401)
  })

  it('returns 400 when payload is invalid', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: '1' } })

    const { POST } = await import('@/app/(core)/api/assets/route')
    const request = new Request('http://localhost/api/assets', {
      method: 'POST',
      headers: { 'content-length': '100' },
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })
})

describe('PUT /api/assets', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null)

    const { PUT } = await import('@/app/(core)/api/assets/route')
    const request = new Request('http://localhost/api/assets', { method: 'PUT' })
    const response = await PUT(request)

    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/assets', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null)

    const { DELETE } = await import('@/app/(core)/api/assets/route')
    const request = new Request('http://localhost/api/assets', { method: 'DELETE' })
    const response = await DELETE(request)

    expect(response.status).toBe(401)
  })

  it('returns 400 when path and version are missing', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: '1' } })

    const { DELETE } = await import('@/app/(core)/api/assets/route')
    const request = new Request('http://localhost/api/assets', { method: 'DELETE' })
    const response = await DELETE(request)

    expect(response.status).toBe(400)
  })
})
