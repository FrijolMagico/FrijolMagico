import { describe, expect, mock, test } from 'bun:test'

import {
  CANONICAL_CATALOG_SLUGS_CACHE_TAG,
  CATALOG_BASE_CACHE_TAG
} from '@frijolmagico/cache-tags'

const cacheConfigurations: unknown[] = []
const executeQuery = mock(async () => ({ data: [{ slug: 'current-name' }] }))

mock.module('next/cache', () => ({
  unstable_cache: (
    callback: () => Promise<unknown>,
    keyParts: string[],
    options: unknown
  ) => {
    cacheConfigurations.push({ keyParts, options })
    let cached = false
    let value: unknown
    return async () => {
      if (!cached) {
        value = await callback()
        cached = true
      }
      return value
    }
  }
}))
mock.module('next/cache.js', () => ({
  unstable_cache: (
    callback: () => Promise<unknown>,
    keyParts: string[],
    options: unknown
  ) => {
    cacheConfigurations.push({ keyParts, options })
    let cached = false
    let value: unknown
    return async () => {
      if (!cached) {
        value = await callback()
        cached = true
      }
      return value
    }
  }
}))
mock.module('@frijolmagico/database/client', () => ({ executeQuery }))

const {
  CANONICAL_CATALOG_SLUGS_QUERY,
  createCanonicalSlugsGet,
  getCachedCanonicalCatalogSlugs
} = await import('./route')

describe('canonical catalog slugs route', () => {
  test('selects only active nondeleted canonical slugs without reading full catalog rows', () => {
    expect(CANONICAL_CATALOG_SLUGS_QUERY).toMatch(/SELECT a\.slug\s+FROM catalogo_artista ca/)
    expect(CANONICAL_CATALOG_SLUGS_QUERY).toContain('ca.activo = 1')
    expect(CANONICAL_CATALOG_SLUGS_QUERY).toContain('ca.deleted_at IS NULL')
    expect(CANONICAL_CATALOG_SLUGS_QUERY).not.toMatch(/correo|imagen|participacion/i)
  })

  test('uses the canonical-slugs tag instead of the catalog-base tag', () => {
    expect(cacheConfigurations).toContainEqual({
      keyParts: ['canonical-catalog-slugs'],
      options: {
        tags: [CANONICAL_CATALOG_SLUGS_CACHE_TAG],
        revalidate: false
      }
    })
    expect(CANONICAL_CATALOG_SLUGS_CACHE_TAG).not.toBe(CATALOG_BASE_CACHE_TAG)
  })

  test('serves the cached compact slug list with no-store response headers', async () => {
    const response = await createCanonicalSlugsGet(async () => ['current-name'])()
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual({ slugs: ['current-name'] })
  })

  test('elapsed time does not trigger another database query', async () => {
    executeQuery.mockClear()
    const originalDateNow = Date.now
    let elapsed = 0
    Date.now = () => elapsed
    try {
      const get = createCanonicalSlugsGet(getCachedCanonicalCatalogSlugs)
      await get()
      elapsed = 60_001
      await get()
      expect(executeQuery).toHaveBeenCalledTimes(1)
    } finally {
      Date.now = originalDateNow
    }
  })

  test('fails closed with 503 if the cached database read fails', async () => {
    const get = createCanonicalSlugsGet(async () => {
      throw new Error('private database connection')
    })
    const response = await get()
    expect(response.status).toBe(503)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.text()).not.toContain('private database connection')
  })
})
