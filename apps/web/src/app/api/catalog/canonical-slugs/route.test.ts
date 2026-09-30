import { describe, expect, test } from 'bun:test'

import { CANONICAL_CATALOG_SLUGS_QUERY, createCanonicalSlugsGet } from './route'

describe('canonical catalog slugs route', () => {
  test('selects only active nondeleted canonical slugs without reading full catalog rows', () => {
    expect(CANONICAL_CATALOG_SLUGS_QUERY).toMatch(/SELECT a\.slug\s+FROM catalogo_artista ca/)
    expect(CANONICAL_CATALOG_SLUGS_QUERY).toContain('ca.activo = 1')
    expect(CANONICAL_CATALOG_SLUGS_QUERY).toContain('ca.deleted_at IS NULL')
    expect(CANONICAL_CATALOG_SLUGS_QUERY).not.toMatch(/correo|imagen|participacion/i)
  })

  test('serves a fresh snapshot with only public slugs', async () => {
    let freshReads = 0
    const get = createCanonicalSlugsGet(
      async () => ({ slugs: ['current-name'], loadedAt: 10_000 }),
      async () => { freshReads++; return { slugs: [], loadedAt: 10_000 } },
      () => 60_000
    )
    const response = await get()
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual({ slugs: ['current-name'] })
    expect(freshReads).toBe(0)
  })

  test('runs a fresh compact SELECT if the cached snapshot is older than 60 seconds', async () => {
    let freshReads = 0
    const get = createCanonicalSlugsGet(
      async () => ({ slugs: ['reassigned-name'], loadedAt: 1000 }),
      async () => { freshReads++; return { slugs: ['current-name'], loadedAt: 61_002 } },
      () => 61_002
    )
    const response = await get()
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ slugs: ['current-name'] })
    expect(freshReads).toBe(1)
  })

  test('fails closed with 503 if the fresh read fails instead of returning stale slugs', async () => {
    const get = createCanonicalSlugsGet(
      async () => ({ slugs: ['reassigned-name'], loadedAt: 1000 }),
      async () => { throw new Error('private database connection') },
      () => 61_002
    )
    const response = await get()
    expect(response.status).toBe(503)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.text()).not.toContain('private database connection')
  })

  test('rejects a still-expired fresh result and does not serve future-dated snapshots', async () => {
    const expired = createCanonicalSlugsGet(
      async () => ({ slugs: ['old'], loadedAt: 0 }),
      async () => ({ slugs: ['old'], loadedAt: 0 }),
      () => 60_001
    )
    expect((await expired()).status).toBe(503)
    const future = createCanonicalSlugsGet(
      async () => ({ slugs: ['old'], loadedAt: 60_002 }),
      async () => ({ slugs: ['new'], loadedAt: 60_001 }),
      () => 60_001
    )
    expect(await (await future()).json()).toEqual({ slugs: ['new'] })
  })
})
