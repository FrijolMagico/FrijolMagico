import { beforeEach, describe, it, expect, mock } from 'bun:test'

mock.module('server-only', () => ({}))

interface MockSession {
  user: { id: string }
}

const mockGetSession = mock(async (): Promise<MockSession | null> => null)
const mockRequireAuth = mock(async (): Promise<MockSession | null> => null)
const mockGetUser = mock(async (): Promise<MockSession['user'] | null> => null)
const mockUploadAsset = mock(async () => ({
  path: 'artist-avatar/abc/ver.webp',
  version: 'ver'
}))
const mockReplaceAsset = mock(async () => ({
  path: 'artist-avatar/abc/ver2.webp',
  version: 'ver2'
}))
const mockDeleteAsset = mock(async () => {})

interface ReplacementFields {
  currentPath?: string
  currentVersion?: string
}

function createUploadRequest(replacement: ReplacementFields): Request {
  const formData = new FormData()
  formData.append('assetTarget', 'artist-avatar')
  formData.append('entityId', 'abc')
  formData.append('blob', new Blob(['fake-webp'], { type: 'image/webp' }))
  formData.append('preparedWidth', '800')
  formData.append('preparedHeight', '800')
  if (replacement.currentPath) {
    formData.append('currentPath', replacement.currentPath)
  }
  if (replacement.currentVersion) {
    formData.append('currentVersion', replacement.currentVersion)
  }

  return new Request('http://localhost/api/assets', {
    method: 'PUT',
    body: formData
  })
}

mock.module('@/shared/lib/auth/utils', () => ({
  getSession: mockGetSession,
  requireAuth: mockRequireAuth,
  getUser: mockGetUser
}))

mock.module('@/shared/assets-manager/server/r2-adapter', () => ({
  R2Adapter: mock(() => ({
    uploadAsset: mockUploadAsset,
    replaceAsset: mockReplaceAsset,
    deleteAsset: mockDeleteAsset
  })),
  createR2Config: mock(() => ({
    endpoint: 'https://mock.r2.dev',
    bucketName: 'test-bucket',
    accessKeyId: 'test-key',
    secretAccessKey: 'test-secret'
  }))
}))

describe('POST /api/assets', () => {
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
})

describe('PUT /api/assets', () => {
  beforeEach(() => {
    mockReplaceAsset.mockClear()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null)

    const { PUT } = await import('@/app/(core)/api/assets/route')
    const request = new Request('http://localhost/api/assets', {
      method: 'PUT'
    })
    const response = await PUT(request)

    expect(response.status).toBe(401)
  })

  it('replaces an asset from one multipart request', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: '1' } })

    const { PUT } = await import('@/app/(core)/api/assets/route')
    const response = await PUT(
      createUploadRequest({
        currentPath: 'artist-avatar/abc/ver.webp',
        currentVersion: 'ver'
      })
    )

    expect(response.status).toBe(200)
    expect(mockReplaceAsset).toHaveBeenCalledWith(
      'artist-avatar',
      'abc',
      { path: 'artist-avatar/abc/ver.webp', version: 'ver' },
      expect.any(Blob),
      'image/webp'
    )
  })

  it('returns 400 when the current asset reference is missing', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: '1' } })

    const { PUT } = await import('@/app/(core)/api/assets/route')
    const response = await PUT(createUploadRequest({}))

    expect(response.status).toBe(400)
    expect(mockReplaceAsset).not.toHaveBeenCalled()
  })

  it('returns 400 when the current asset reference is partial', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: '1' } })

    const { PUT } = await import('@/app/(core)/api/assets/route')
    const response = await PUT(
      createUploadRequest({ currentPath: 'artist-avatar/abc/ver.webp' })
    )

    expect(response.status).toBe(400)
    expect(mockReplaceAsset).not.toHaveBeenCalled()
  })
})

describe('DELETE /api/assets', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null)

    const { DELETE } = await import('@/app/(core)/api/assets/route')
    const request = new Request('http://localhost/api/assets', {
      method: 'DELETE'
    })
    const response = await DELETE(request)

    expect(response.status).toBe(401)
  })

  it('returns 400 when path and version are missing', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: '1' } })

    const { DELETE } = await import('@/app/(core)/api/assets/route')
    const request = new Request('http://localhost/api/assets', {
      method: 'DELETE'
    })
    const response = await DELETE(request)

    expect(response.status).toBe(400)
  })
})
