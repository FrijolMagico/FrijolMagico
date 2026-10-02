import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  buildWebInvalidationUrl,
  revalidateWebCache,
  revalidateWebCacheBestEffort
} from '@/shared/lib/web-invalidation'

const ORIGINAL_ENV = { ...process.env }

let mockFetch: ReturnType<typeof mock>

beforeEach(() => {
  process.env.WEB_REVALIDATION_URL = 'https://web.test/api/revalidate'
  process.env.REVALIDATION_SECRET = 'test-secret-123'

  mockFetch = mock(() =>
    Promise.resolve(
      new Response(JSON.stringify({ revalidated: true }), { status: 200 })
    )
  )
  globalThis.fetch = mockFetch as unknown as typeof fetch
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

// ---------------------------------------------------------------------------
// buildWebInvalidationUrl
// ---------------------------------------------------------------------------

describe('buildWebInvalidationUrl', () => {
  test('uses WEB_REVALIDATION_URL env var when no explicit URL given', () => {
    const url = buildWebInvalidationUrl()
    expect(url).toBe('https://web.test/api/revalidate')
  })

  test('uses explicit URL over env var', () => {
    const url = buildWebInvalidationUrl({
      url: 'https://custom.test/revalidate'
    })
    expect(url).toBe('https://custom.test/revalidate')
  })

  test('includes explicit SWR mode with a tag by default', () => {
    const url = buildWebInvalidationUrl({ tag: 'home:featured-artists' })
    expect(url).toBe(
      'https://web.test/api/revalidate?tag=home%3Afeatured-artists&mode=swr'
    )
  })

  test('includes explicit immediate mode with a tag when requested', () => {
    const url = buildWebInvalidationUrl({
      tag: 'home:featured-artists',
      mode: 'immediate'
    })
    expect(url).toBe(
      'https://web.test/api/revalidate?tag=home%3Afeatured-artists&mode=immediate'
    )
  })

  test('rejects a runtime-invalid mode', () => {
    const options = { tag: 'home:featured-artists' }
    Object.assign(options, { mode: 'invalid' })

    expect(() => buildWebInvalidationUrl(options)).toThrow()
  })

  test('appends path query param without requiring tag mode', () => {
    const url = buildWebInvalidationUrl({ path: '/' })
    expect(url).toBe('https://web.test/api/revalidate?path=%2F')
  })

  test('appends path type alongside a path-only invalidation', () => {
    const url = buildWebInvalidationUrl({ path: '/', pathType: 'page' })
    expect(url).toBe(
      'https://web.test/api/revalidate?path=%2F&pathType=page'
    )
  })

  test('appends tag mode, path, and path type query params together', () => {
    const url = buildWebInvalidationUrl({
      tag: 'home:featured-artists',
      path: '/',
      pathType: 'layout'
    })
    expect(url).toBe(
      'https://web.test/api/revalidate?tag=home%3Afeatured-artists&mode=swr&path=%2F&pathType=layout'
    )
  })

  test('rejects a runtime-invalid path type', () => {
    const options = { path: '/' }
    Object.assign(options, { pathType: 'invalid' })

    expect(() => buildWebInvalidationUrl(options)).toThrow()
  })

  test('rejects path type without a non-empty path', () => {
    expect(() =>
      buildWebInvalidationUrl({ path: '', pathType: 'page' })
    ).toThrow()
  })

  test('appends tag mode and path query params together', () => {
    const url = buildWebInvalidationUrl({
      tag: 'home:featured-artists',
      path: '/'
    })
    expect(url).toBe(
      'https://web.test/api/revalidate?tag=home%3Afeatured-artists&mode=swr&path=%2F'
    )
  })

  test('returns plain URL when no tag or path', () => {
    const url = buildWebInvalidationUrl({
      url: 'https://plain.test/revalidate'
    })
    expect(url).toBe('https://plain.test/revalidate')
  })

  test('throws when no URL given and env var is missing', () => {
    delete process.env.WEB_REVALIDATION_URL
    expect(() => buildWebInvalidationUrl()).toThrow(
      'WEB_REVALIDATION_URL is not set'
    )
  })
})

// ---------------------------------------------------------------------------
// revalidateWebCache
// ---------------------------------------------------------------------------

describe('revalidateWebCache', () => {
  test('sends POST request with Bearer token to correct URL', async () => {
    const result = await revalidateWebCache()

    expect(mockFetch).toHaveBeenCalledTimes(1)

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://web.test/api/revalidate')
    expect(options.method).toBe('POST')
    expect(options.headers).toEqual(
      expect.objectContaining({
        Authorization: 'Bearer test-secret-123'
      })
    )

    expect(result).toEqual({ revalidated: true })
  })

  test('sends a tag with explicit SWR mode by default', async () => {
    await revalidateWebCache({ tag: 'home:featured-artists' })

    const [url] = mockFetch.mock.calls[0] as [string]
    expect(new URL(url).searchParams.get('tag')).toBe('home:featured-artists')
    expect(new URL(url).searchParams.get('mode')).toBe('swr')
  })

  test('sends a tag with explicit immediate mode when requested', async () => {
    await revalidateWebCache({
      tag: 'home:featured-artists',
      mode: 'immediate'
    })

    const [url] = mockFetch.mock.calls[0] as [string]
    expect(new URL(url).searchParams.get('mode')).toBe('immediate')
  })

  test('sends path-only invalidation without tag mode', async () => {
    await revalidateWebCache({ path: '/artists' })

    const [url] = mockFetch.mock.calls[0] as [string]
    expect(new URL(url).searchParams.get('path')).toBe('/artists')
    expect(new URL(url).searchParams.has('mode')).toBe(false)
  })

  test('returns WebInvalidationResult on success', async () => {
    const result = await revalidateWebCache()
    expect(result).toEqual({ revalidated: true })
  })

  test('throws when REVALIDATION_SECRET is missing', async () => {
    delete process.env.REVALIDATION_SECRET

    try {
      await revalidateWebCache()
      expect.unreachable('should have thrown')
    } catch (error) {
      expect((error as Error).message).toContain(
        'REVALIDATION_SECRET is not set'
      )
    }

    expect(mockFetch).not.toHaveBeenCalled()
  })

  test('throws when WEB_REVALIDATION_URL is missing', async () => {
    delete process.env.WEB_REVALIDATION_URL

    try {
      await revalidateWebCache()
      expect.unreachable('should have thrown')
    } catch (error) {
      expect((error as Error).message).toContain(
        'WEB_REVALIDATION_URL is not set'
      )
    }

    expect(mockFetch).not.toHaveBeenCalled()
  })

  test('throws on non-ok response', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          statusText: 'Unauthorized'
        })
      )
    )

    try {
      await revalidateWebCache()
      expect.unreachable('should have thrown')
    } catch (error) {
      expect((error as Error).message).toContain(
        'Failed to invalidate cache: 401'
      )
    }
  })

  test('throws when revalidated field is false', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve(
        new Response(JSON.stringify({ revalidated: false }), { status: 200 })
      )
    )

    try {
      await revalidateWebCache()
      expect.unreachable('should have thrown')
    } catch (error) {
      expect((error as Error).message).toContain(
        'Cache invalidation was not confirmed'
      )
    }
  })

  test('re-throws network errors', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Network failure'))
    )

    try {
      await revalidateWebCache()
      expect.unreachable('should have thrown')
    } catch (error) {
      expect((error as Error).message).toContain('Network failure')
    }
  })

  test('throws when response JSON is malformed', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve(new Response('not-json', { status: 200 }))
    )

    try {
      await revalidateWebCache()
      expect.unreachable('should have thrown')
    } catch {
      // expected
    }
  })
})

describe('revalidateWebCacheBestEffort', () => {
  test('logs an invalidation failure without rejecting', async () => {
    const error = new Error('Network failure')
    const logger = { error: mock(() => {}) }

    await expect(
      revalidateWebCacheBestEffort(
        { tag: 'catalogo:artistas', path: '/catalogo' },
        { revalidate: async () => Promise.reject(error), logger }
      )
    ).resolves.toBeUndefined()

    expect(logger.error).toHaveBeenCalledWith(
      'Web cache invalidation failed',
      error
    )
  })

  test('does not log when invalidation succeeds', async () => {
    const logger = { error: mock(() => {}) }

    await revalidateWebCacheBestEffort(
      { tag: 'catalogo:artistas' },
      { revalidate: async () => ({ revalidated: true }), logger }
    )

    expect(logger.error).not.toHaveBeenCalled()
  })
})
