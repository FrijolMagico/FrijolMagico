import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'

type RevalidateWebCacheOptions = Parameters<
  typeof import('@/shared/lib/web-invalidation').revalidateWebCache
>[0]

// ---------------------------------------------------------------------------
// Mocks — must be declared BEFORE importing the route handler
// ---------------------------------------------------------------------------

const mockRotateFeaturedArtists = mock(() =>
  Promise.resolve({ rotated: true, count: 3 } as const)
)

const mockFisherYatesShuffle = mock((arr: readonly unknown[]) => [...arr])

const mockSelectFeaturedArtists = mock((candidates: readonly unknown[]) => [])

const mockInvalidateWebFeaturedArtists = mock(
  (_options: RevalidateWebCacheOptions) =>
    Promise.resolve({ revalidated: true } as const)
)

const transactionEvents: string[] = []

const mockBuildWebInvalidationUrl = mock(
  () => 'https://example.com/api/revalidate'
)

const mockRevalidateWebCacheBestEffort = mock(async () => {})

const mockTransaction = mock((fn: (tx: unknown) => Promise<unknown>) =>
  fn('mock-tx')
)

mock.module('@frijolmagico/database/orm', () => ({
  db: { transaction: mockTransaction }
}))

mock.module('@/app/(cron)/_lib/rotate-featured-artists', () => ({
  rotateFeaturedArtists: mockRotateFeaturedArtists,
  fisherYatesShuffle: mockFisherYatesShuffle,
  selectFeaturedArtists: mockSelectFeaturedArtists
}))

mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCache: mockInvalidateWebFeaturedArtists,
  buildWebInvalidationUrl: mockBuildWebInvalidationUrl,
  revalidateWebCacheBestEffort: mockRevalidateWebCacheBestEffort
}))

const { GET } = await import('@/app/(cron)/api/cron/featured-artists/route')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const originalEnv = { ...process.env }

function createRequest(authHeader?: string): Request {
  const headers = new Headers()
  if (authHeader) {
    headers.set('Authorization', authHeader)
  }
  return new Request('http://localhost/api/cron/featured-artists', {
    method: 'GET',
    headers
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  process.env.CRON_SECRET = 'test-cron-secret'
  mockRotateFeaturedArtists.mockClear()
  mockInvalidateWebFeaturedArtists.mockClear()
  transactionEvents.length = 0
  mockTransaction.mockClear()
  mockRotateFeaturedArtists.mockImplementation(() =>
    Promise.resolve({ rotated: true, count: 3 })
  )
  mockTransaction.mockImplementation((fn) => fn('mock-tx'))
})

afterEach(() => {
  process.env = { ...originalEnv }
})

describe('GET /api/cron/featured-artists', () => {
  test('returns 401 when Authorization header is missing', async () => {
    const request = createRequest()
    const response = await GET(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toEqual({ error: 'Unauthorized' })
  })

  test('returns 401 when CRON_SECRET does not match', async () => {
    const request = createRequest('Bearer wrong-secret')
    const response = await GET(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toEqual({ error: 'Unauthorized' })
  })

  test('returns 200 with rotation result on valid auth', async () => {
    const request = createRequest('Bearer test-cron-secret')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ rotated: true, count: 3 })
  })

  test('calls rotateFeaturedArtists inside a transaction', async () => {
    const request = createRequest('Bearer test-cron-secret')
    await GET(request)

    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(mockRotateFeaturedArtists).toHaveBeenCalledTimes(1)
    expect(mockRotateFeaturedArtists).toHaveBeenCalledWith('mock-tx')
  })

  test('revalidates only the featured-artists tag with SWR after transaction completion', async () => {
    mockTransaction.mockImplementation(async (fn) => {
      const result = await fn('mock-tx')
      transactionEvents.push('transaction-completed')
      return result
    })
    mockInvalidateWebFeaturedArtists.mockImplementation(async (options) => {
      transactionEvents.push('cache-invalidated')
      expect(options).toEqual({ tag: 'home:destacados', mode: 'swr' })
      expect(options).not.toHaveProperty('path')
      return { revalidated: true }
    })

    const request = createRequest('Bearer test-cron-secret')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockInvalidateWebFeaturedArtists).toHaveBeenCalledTimes(1)
    expect(transactionEvents).toEqual([
      'transaction-completed',
      'cache-invalidated'
    ])
  })

  test('returns 500 when transaction throws', async () => {
    mockTransaction.mockImplementation(() => {
      throw new Error('DB connection lost')
    })

    const consoleError = mock(() => {})
    const originalError = console.error
    console.error = consoleError as never

    const request = createRequest('Bearer test-cron-secret')
    const response = await GET(request)

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body).toEqual({ error: 'Rotation failed' })
    expect(consoleError).toHaveBeenCalledTimes(1)

    console.error = originalError
  })

  test('does not call revalidateWebCache when the transaction rejects', async () => {
    mockTransaction.mockImplementation(() =>
      Promise.reject(new Error('DB error'))
    )

    const originalError = console.error
    console.error = mock(() => {}) as never

    const request = createRequest('Bearer test-cron-secret')
    const response = await GET(request)

    expect(response.status).toBe(500)
    expect(mockInvalidateWebFeaturedArtists).not.toHaveBeenCalled()

    console.error = originalError
  })

  test('returns failure when cache invalidation fails', async () => {
    mockInvalidateWebFeaturedArtists.mockImplementation(() =>
      Promise.reject(new Error('Cache invalidation failed'))
    )

    const originalError = console.error
    console.error = mock(() => {}) as never

    const request = createRequest('Bearer test-cron-secret')
    const response = await GET(request)

    expect(response.status).toBe(500)
    expect(mockInvalidateWebFeaturedArtists).toHaveBeenCalledTimes(1)

    console.error = originalError
  })

  test('returns 401 when CRON_SECRET env is not set', async () => {
    delete process.env.CRON_SECRET

    const request = createRequest('Bearer any-value')
    const response = await GET(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toEqual({ error: 'Unauthorized' })
  })
})
