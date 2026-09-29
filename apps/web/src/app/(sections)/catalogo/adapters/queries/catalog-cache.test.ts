import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'bun:test'

import {
  CATALOG_BASE_CACHE_TAG,
  CATALOG_EDITION_DATES_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG
} from '@frijolmagico/cache-tags'

const cacheSource = readFileSync(new URL('./catalog-cache.ts', import.meta.url), 'utf8')
const catalogDataSource = readFileSync(
  new URL('../../lib/getCatalogData.ts', import.meta.url),
  'utf8'
)

describe('catalog read cache boundaries', () => {
  test('assigns a distinct cache tag to each independently cached set-based read', () => {
    const layers = [
      ['getCachedCatalogBaseRows', 'CATALOG_BASE_CACHE_TAG', CATALOG_BASE_CACHE_TAG],
      ['getCachedCatalogParticipationRows', 'CATALOG_PARTICIPATION_CACHE_TAG', CATALOG_PARTICIPATION_CACHE_TAG],
      ['getCachedCatalogEditionDateRows', 'CATALOG_EDITION_DATES_CACHE_TAG', CATALOG_EDITION_DATES_CACHE_TAG]
    ] as const

    expect(new Set(layers.map(([, tag]) => tag)).size).toBe(3)

    for (const [functionName, tagConstant, tag] of layers) {
      const functionSource = cacheSource.match(
        new RegExp(`export async function ${functionName}\\([\\s\\S]*?\\n}`)
      )?.[0]
      expect(functionSource).toContain("'use cache'")
      expect(functionSource).toContain(`cacheTag(${tagConstant})`)
    }
  })

  test('keeps catalog composition outside the persistent whole-result cache', () => {
    expect(catalogDataSource).not.toContain("'use cache'")
    expect(catalogDataSource).not.toContain('cacheTag(')
  })
})
