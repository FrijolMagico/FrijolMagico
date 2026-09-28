import { describe, expect, test } from 'bun:test'

import { CatalogArtistSchema } from '../schemas/catalogArtistSchema'
import {
  CATALOG_ALIAS_QUERY,
  resolveCatalogArtistSlug
} from './getArtistBySlug'

const artist = CatalogArtistSchema.parse({
  id: 1,
  name: 'Artist',
  slug: 'current-name',
  email: null,
  rrss: null,
  city: null,
  country: null,
  bio: null,
  orden: '1',
  destacado: 0,
  avatar: null,
  category: null,
  collective: null,
  editions: []
})

describe('catalog slug resolution', () => {
  test('resolves an old canonical alias directly to the artist current canonical slug', () => {
    const resolution = resolveCatalogArtistSlug(
      [artist],
      'old-name',
      'current-name'
    )

    expect(resolution).toEqual({ artist, isAlias: true })
    if (resolution.isAlias) expect(`/catalogo/${resolution.artist.slug}`).toBe('/catalogo/current-name')
  })

  test('keeps a canonical slug on the normal rendering path, even if it is also supplied as an alias', () => {
    expect(
      resolveCatalogArtistSlug([artist], 'current-name', 'another-name')
    ).toEqual({ artist, isAlias: false })
  })

  test('does not resolve stale aliases without a current catalog listing', () => {
    expect(resolveCatalogArtistSlug([], 'old-name', null)).toEqual({
      artist: null,
      isAlias: false
    })
  })

  test('does not resolve unknown slugs', () => {
    expect(resolveCatalogArtistSlug([artist], 'unknown-name', null)).toEqual({
      artist: null,
      isAlias: false
    })
  })

  test('limits aliases to artists with an active, non-deleted catalog listing', () => {
    expect(CATALOG_ALIAS_QUERY).toContain('JOIN catalogo_artista ca ON ca.artista_id = a.id')
    expect(CATALOG_ALIAS_QUERY).toContain('AND ca.activo = 1')
    expect(CATALOG_ALIAS_QUERY).toContain('AND ca.deleted_at IS NULL')
  })
})
