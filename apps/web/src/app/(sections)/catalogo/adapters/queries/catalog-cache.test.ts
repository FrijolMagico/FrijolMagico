import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'bun:test'

import {
  CATALOG_BASE_CACHE_TAG,
  CATALOG_EDITION_DATES_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG
} from '@frijolmagico/cache-tags'

const cacheSource = readFileSync(
  new URL('./catalog-cache.ts', import.meta.url),
  'utf8'
)
const nonCatalogCacheSources = [
  [
    'getAboutData',
    readFileSync(
      new URL('../../../nosotros/lib/getAboutData.ts', import.meta.url),
      'utf8'
    )
  ],
  [
    'getFestivalesData',
    readFileSync(
      new URL('../../../festivales/lib/getFestivalesData.ts', import.meta.url),
      'utf8'
    )
  ],
  [
    'getFestivalBySlug',
    readFileSync(
      new URL(
        '../../../festivales/[slug]/lib/getFestivalBySlug.ts',
        import.meta.url
      ),
      'utf8'
    )
  ],
  [
    'getAdjacentFestivals',
    readFileSync(
      new URL(
        '../../../festivales/[slug]/lib/getAdjacentFestivals.ts',
        import.meta.url
      ),
      'utf8'
    )
  ],
  [
    'getActiveFestival',
    readFileSync(
      new URL(
        '../../../../../data/data-access-layer/festivals/getActiveFestival.ts',
        import.meta.url
      ),
      'utf8'
    )
  ],
  [
    'getEditionDays',
    readFileSync(
      new URL(
        '../../../../../data/data-access-layer/festivals/getEditionDays.ts',
        import.meta.url
      ),
      'utf8'
    )
  ]
] as const
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

    for (const [functionName, tagConstant] of layers) {
      const functionSource = cacheSource.match(
        new RegExp(`export async function ${functionName}\\([\\s\\S]*?\\n}`)
      )?.[0]
      expect(functionSource).toContain("'use cache: remote'")
      expect(functionSource).toContain(`cacheTag(${tagConstant})`)
    }
  })

  test('uses the event-driven Cache Components lifetime for all nine DB scopes', () => {
    const profile =
      /cacheLife\(\{\s*stale:\s*5\s*\*\s*60,\s*revalidate:\s*Infinity,\s*expire:\s*Infinity\s*\}\)/
    const scopes = [
      ['getCachedCatalogBaseRows', cacheSource],
      ['getCachedCatalogParticipationRows', cacheSource],
      ['getCachedCatalogEditionDateRows', cacheSource],
      ...nonCatalogCacheSources
    ] as const

    for (const [functionName, source] of scopes) {
      const functionSource = source
        .slice(source.indexOf(`export async function ${functionName}(`))
        .split('\nexport async function ', 1)[0]
      expect(functionSource, `${functionName} should exist`).toContain(
        "'use cache: remote'"
      )
      expect(
        functionSource,
        `${functionName} should use the approved lifetime`
      ).toMatch(profile)
    }
  })

  test('keeps catalog composition outside the persistent whole-result cache', () => {
    expect(catalogDataSource).not.toContain("'use cache'")
    expect(catalogDataSource).not.toContain('cacheTag(')
  })
})
