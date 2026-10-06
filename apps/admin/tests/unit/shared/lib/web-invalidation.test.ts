import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  CANONICAL_CATALOG_SLUGS_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG,
  resolveWebRevalidationMode
} from '@frijolmagico/cache-tags'
import {
  buildWebInvalidationUrl,
  revalidateWebCache,
  revalidateWebCacheBatch,
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
  test('resolves protected and ordinary tag modes', () => {
    expect(resolveWebRevalidationMode(FESTIVAL_CRITICAL_CACHE_TAG)).toBe(
      'immediate'
    )
    expect(
      resolveWebRevalidationMode(CANONICAL_CATALOG_SLUGS_CACHE_TAG, 'swr')
    ).toBe('immediate')
    expect(resolveWebRevalidationMode('ordinary-tag')).toBe('swr')
    expect(resolveWebRevalidationMode('ordinary-tag', 'immediate')).toBe(
      'immediate'
    )
  })

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

  test.each([FESTIVAL_CRITICAL_CACHE_TAG, CANONICAL_CATALOG_SLUGS_CACHE_TAG])(
    'defaults protected tag %s to immediate mode',
    (tag) => {
      expect(
        new URL(buildWebInvalidationUrl({ tag })).searchParams.get('mode')
      ).toBe('immediate')
    }
  )

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
    expect(url).toBe('https://web.test/api/revalidate?path=%2F&pathType=page')
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

  test.each([FESTIVAL_CRITICAL_CACHE_TAG, CANONICAL_CATALOG_SLUGS_CACHE_TAG])(
    'uses immediate mode by default for protected tag %s',
    async (tag) => {
      await revalidateWebCache({ tag })

      const [url] = mockFetch.mock.calls[0] as [string]
      expect(new URL(url).searchParams.get('mode')).toBe('immediate')
    }
  )

  test('accepts explicit immediate mode for protected tags', async () => {
    await revalidateWebCache({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate'
    })

    const [url] = mockFetch.mock.calls[0] as [string]
    expect(new URL(url).searchParams.get('mode')).toBe('immediate')
  })

  test('rejects explicit SWR for protected tags before fetch or retry', async () => {
    const logger = { error: mock(() => {}) }
    const originalError = console.error
    console.error = mock(() => {})

    try {
      await expect(
        revalidateWebCache({ tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'swr' })
      ).rejects.toMatchObject({ category: 'configuration' })
      await expect(
        revalidateWebCacheBestEffort(
          { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'swr' },
          { logger }
        )
      ).resolves.toBeUndefined()
    } finally {
      console.error = originalError
    }

    expect(mockFetch).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(logger.error.mock.calls)).toContain('configuration')
  })

  test('uses immediate tag invalidation when requested', async () => {
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

  test('re-throws network errors after the single retry', async () => {
    mockFetch.mockImplementation(() =>
      Promise.reject(new Error('Network failure'))
    )

    try {
      await revalidateWebCache()
      expect.unreachable('should have thrown')
    } catch (error) {
      expect((error as Error).message).toContain('Network failure')
    }
  })

  test('throws when response JSON is malformed without logging its body', async () => {
    const sentinel = 'private-response-body-sentinel'
    const errorSpy = mock(() => {})
    const originalError = console.error
    console.error = errorSpy
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve(new Response(sentinel, { status: 200 }))
    )

    try {
      await expect(revalidateWebCache()).rejects.toThrow()
    } finally {
      console.error = originalError
    }
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain(sentinel)
  })

  test('retries a transient status once and then succeeds', async () => {
    mockFetch
      .mockImplementationOnce(() =>
        Promise.resolve(new Response('', { status: 503 }))
      )
      .mockImplementationOnce(() =>
        Promise.resolve(
          new Response(JSON.stringify({ revalidated: true }), { status: 200 })
        )
      )

    await expect(revalidateWebCache({ tag: 'retry-tag' })).resolves.toEqual({
      revalidated: true
    })
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  test('does not retry authorization failures', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve(new Response('', { status: 401 }))
    )

    await expect(revalidateWebCache()).rejects.toThrow(
      'Failed to invalidate cache: 401'
    )
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  test('does not start a request when the operation deadline has expired', async () => {
    const clockDescriptor = Object.getOwnPropertyDescriptor(performance, 'now')
    let calls = 0
    Object.defineProperty(performance, 'now', {
      configurable: true,
      value: () => (calls++ === 0 ? 0 : 5_001)
    })
    mockFetch.mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ revalidated: true }), { status: 200 })
      )
    )

    try {
      await expect(revalidateWebCache()).rejects.toThrow('timed out')
    } finally {
      if (clockDescriptor)
        Object.defineProperty(performance, 'now', clockDescriptor)
    }
    expect(mockFetch).not.toHaveBeenCalled()
  })

  test('does not accept an immediate response after the deadline', async () => {
    const clockDescriptor = Object.getOwnPropertyDescriptor(performance, 'now')
    let calls = 0
    Object.defineProperty(performance, 'now', {
      configurable: true,
      value: () => [0, 0, 5_001][calls++] ?? 5_001
    })
    mockFetch.mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ revalidated: true }), { status: 200 })
      )
    )

    try {
      await expect(revalidateWebCache()).rejects.toThrow('timed out')
    } finally {
      if (clockDescriptor)
        Object.defineProperty(performance, 'now', clockDescriptor)
    }
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  test('does not start a retry after a failure exhausts the shared deadline', async () => {
    const clockDescriptor = Object.getOwnPropertyDescriptor(performance, 'now')
    let now = 0
    Object.defineProperty(performance, 'now', {
      configurable: true,
      value: () => now
    })
    mockFetch.mockImplementationOnce(() => {
      now = 5_001
      return Promise.reject(new Error('temporary network failure'))
    })

    try {
      await expect(revalidateWebCache()).rejects.toThrow('timed out')
    } finally {
      if (clockDescriptor)
        Object.defineProperty(performance, 'now', clockDescriptor)
    }
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  test('classifies invalid endpoint configuration without exposing its URL', async () => {
    const endpoints = [
      'https://[malformed-endpoint.invalid/path',
      'ftp://sensitive-endpoint.invalid/path'
    ]
    const errorSpy = mock(() => {})
    const originalError = console.error
    console.error = errorSpy

    try {
      for (const endpoint of endpoints) {
        process.env.WEB_REVALIDATION_URL = endpoint
        try {
          await revalidateWebCache()
          expect.unreachable('invalid endpoint should have thrown')
        } catch (error) {
          expect((error as Error).message).toBe(
            'Invalid web revalidation endpoint'
          )
          expect((error as Error).message).not.toContain(endpoint)
        }
      }
    } finally {
      console.error = originalError
    }
    expect(mockFetch).not.toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalledTimes(endpoints.length)
    const logged = JSON.stringify(errorSpy.mock.calls)
    expect(logged).toContain('configuration')
    for (const endpoint of endpoints) expect(logged).not.toContain(endpoint)
  })

  test('retries a timed-out request and clears its attempt timer', async () => {
    const setTimeoutDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'setTimeout'
    )
    const originalSetTimeout = globalThis.setTimeout
    const scheduledTimers: ReturnType<typeof setTimeout>[] = []
    let expireAttempt: (() => void) | undefined
    Object.defineProperty(globalThis, 'setTimeout', {
      configurable: true,
      value: (callback: Parameters<typeof globalThis.setTimeout>[0]) => {
        expireAttempt = callback
        const timer = originalSetTimeout(callback, 0)
        scheduledTimers.push(timer)
        return timer
      }
    })
    mockFetch
      .mockImplementationOnce(
        (_input, init) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(new Error('aborted'))
            )
          })
      )
      .mockImplementationOnce(() =>
        Promise.resolve(
          new Response(JSON.stringify({ revalidated: true }), { status: 200 })
        )
      )

    try {
      const result = revalidateWebCache()
      expireAttempt?.()
      await expect(result).resolves.toEqual({ revalidated: true })
    } finally {
      if (setTimeoutDescriptor)
        Object.defineProperty(globalThis, 'setTimeout', setTimeoutDescriptor)
    }
    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(scheduledTimers).toHaveLength(2)
    expect(scheduledTimers.every((timer) => !timer.hasRef())).toBe(true)
  })

  test('logs only sanitized final failure data', async () => {
    const secret = 'sensitive-error-sentinel'
    const logger = mock(() => {})
    const originalError = console.error
    console.error = logger
    mockFetch.mockImplementation(() => Promise.reject(new Error(secret)))

    try {
      await expect(revalidateWebCache({ tag: 'safe-tag' })).rejects.toThrow()
    } finally {
      console.error = originalError
    }

    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(logger).toHaveBeenCalledTimes(1)
    const logged = JSON.stringify(logger.mock.calls)
    expect(logged).not.toContain(secret)
    expect(logged).toContain('network')
    expect(logged).toContain('safe-tag')
    expect(logged).toContain('swr')
    expect(logged).toContain('attempts')
    expect(logged).toContain('durationMs')
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

    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain(
      'Network failure'
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

  test('uses the injected logger for default transport failures only once', async () => {
    const logger = { error: mock(() => {}) }
    const consoleError = mock(() => {})
    const originalError = console.error
    console.error = consoleError
    mockFetch.mockImplementation(() =>
      Promise.resolve(new Response('', { status: 401 }))
    )

    try {
      await expect(
        revalidateWebCacheBestEffort({ tag: 'compat-tag' }, { logger })
      ).resolves.toBeUndefined()
    } finally {
      console.error = originalError
    }
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(consoleError).not.toHaveBeenCalled()
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  test('returns SWR summary when an SWR request fails and independent requests finish', async () => {
    const started: string[] = []
    mockFetch.mockImplementation((input) => {
      const tag = new URL(String(input)).searchParams.get('tag') ?? ''
      started.push(tag)
      return Promise.resolve(
        tag === 'swr-fails'
          ? new Response('', { status: 401 })
          : new Response(JSON.stringify({ revalidated: true }), { status: 200 })
      )
    })
    const originalError = console.error
    console.error = mock(() => {})

    try {
      await expect(
        revalidateWebCacheBatch([
          { tag: 'swr-fails' },
          { tag: 'immediate', mode: 'immediate' },
          { path: '/path-only' }
        ])
      ).resolves.toEqual({ webRevalidation: 'swr' })
    } finally {
      console.error = originalError
    }
    expect(started).toEqual(['swr-fails', 'immediate', ''])
  })

  test('returns immediate for immediate-only requests and undefined for no-effect batches', async () => {
    await expect(
      revalidateWebCacheBatch([
        { tag: 'now', mode: 'immediate' },
        { path: '/only' }
      ])
    ).resolves.toEqual({ webRevalidation: 'immediate' })
    await expect(revalidateWebCacheBatch([])).resolves.toEqual({})
    await expect(revalidateWebCacheBatch([{}])).resolves.toEqual({})
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  test('uses effective protected modes for safe batch summaries, including mixed requests', async () => {
    const logger = mock(() => {})
    const originalError = console.error
    console.error = logger
    mockFetch.mockImplementation((input) =>
      Promise.resolve(
        new URL(String(input)).searchParams.get('tag') ===
          FESTIVAL_CRITICAL_CACHE_TAG
          ? new Response('', { status: 401 })
          : new Response(JSON.stringify({ revalidated: true }), { status: 200 })
      )
    )

    try {
      await expect(
        revalidateWebCacheBatch([{ tag: FESTIVAL_CRITICAL_CACHE_TAG }])
      ).resolves.toEqual({ webRevalidation: 'immediate' })
      await expect(
        revalidateWebCacheBatch([
          { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'swr' },
          { tag: 'ordinary-tag' }
        ])
      ).resolves.toEqual({ webRevalidation: 'swr' })
    } finally {
      console.error = originalError
    }
    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(JSON.stringify(logger.mock.calls)).toContain('immediate')
  })

  test('safe batch logs no more than one failure per failed request', async () => {
    const errorSpy = mock(() => {})
    const originalError = console.error
    console.error = errorSpy
    mockFetch.mockImplementation(() =>
      Promise.reject(new Error('private-network-detail'))
    )

    try {
      await revalidateWebCacheBatch(
        [{ tag: 'private-tag', mode: 'immediate' }],
        'catalog-save'
      )
    } finally {
      console.error = originalError
    }
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(errorSpy.mock.calls)).toContain('catalog-save')
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain(
      'private-network-detail'
    )
    expect(JSON.stringify(errorSpy.mock.calls)).toContain('private-tag')
  })
})
