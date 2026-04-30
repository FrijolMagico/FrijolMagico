import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { invalidateWebFeaturedArtists } from '@/shared/lib/web-invalidation'

const originalEnv = { ...process.env }

const mockFetch = mock(() =>
  Promise.resolve(
    new Response(JSON.stringify({ revalidated: true }), { status: 200 })
  )
)

beforeEach(() => {
  process.env.WEB_REVALIDATION_URL =
    'https://web.test/api/revalidate/featured-artists'
  process.env.REVALIDATION_SECRET = 'test-secret-123'
  globalThis.fetch = mockFetch as unknown as typeof fetch
  mockFetch.mockClear()
})

afterEach(() => {
  process.env = { ...originalEnv }
})

describe('invalidateWebFeaturedArtists', () => {
  test('sends POST with Bearer token to WEB_REVALIDATION_URL', async () => {
    await invalidateWebFeaturedArtists()

    expect(mockFetch).toHaveBeenCalledTimes(1)

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://web.test/api/revalidate/featured-artists')
    expect(options.method).toBe('POST')
    expect(options.headers).toEqual(
      expect.objectContaining({
        Authorization: 'Bearer test-secret-123'
      })
    )
  })

  test('does not throw when fetch succeeds', async () => {
    await expect(invalidateWebFeaturedArtists()).resolves.toBeUndefined()
  })

  test('logs warning and returns when WEB_REVALIDATION_URL is missing', async () => {
    delete process.env.WEB_REVALIDATION_URL

    const consoleWarn = mock(() => {})
    const originalWarn = console.warn
    console.warn = consoleWarn as unknown as typeof console.warn

    await invalidateWebFeaturedArtists()

    expect(mockFetch).not.toHaveBeenCalled()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect((consoleWarn.mock.calls[0] as [string])[0]).toContain(
      'WEB_REVALIDATION_URL'
    )

    console.warn = originalWarn
  })

  test('logs warning and returns when REVALIDATION_SECRET is missing', async () => {
    delete process.env.REVALIDATION_SECRET

    const consoleWarn = mock(() => {})
    const originalWarn = console.warn
    console.warn = consoleWarn as unknown as typeof console.warn

    await invalidateWebFeaturedArtists()

    expect(mockFetch).not.toHaveBeenCalled()
    expect(consoleWarn).toHaveBeenCalledTimes(1)
    expect((consoleWarn.mock.calls[0] as [string])[0]).toContain(
      'REVALIDATION_SECRET'
    )

    console.warn = originalWarn
  })

  test('swallows fetch errors and logs them', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Network failure'))
    )

    const consoleError = mock(() => {})
    const originalError = console.error
    console.error = consoleError as unknown as typeof console.error

    await expect(invalidateWebFeaturedArtists()).resolves.toBeUndefined()
    expect(consoleError).toHaveBeenCalledTimes(1)
    expect((consoleError.mock.calls[0] as [string])[0]).toContain(
      'web featured artists'
    )

    console.error = originalError
  })

  test('uses different URL when WEB_REVALIDATION_URL changes', async () => {
    process.env.WEB_REVALIDATION_URL = 'https://other.test/revalidate'
    process.env.REVALIDATION_SECRET = 'other-secret'

    await invalidateWebFeaturedArtists()

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://other.test/revalidate')
    expect(options.headers).toEqual(
      expect.objectContaining({
        Authorization: 'Bearer other-secret'
      })
    )
  })

  test('swallows non-200 responses and logs them', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )
    )

    const consoleError = mock(() => {})
    const originalError = console.error
    console.error = consoleError as unknown as typeof console.error

    await expect(invalidateWebFeaturedArtists()).resolves.toBeUndefined()
    expect(consoleError).toHaveBeenCalledTimes(1)
    expect((consoleError.mock.calls[0] as [string])[0]).toContain(
      'web featured artists'
    )

    console.error = originalError
  })
})
