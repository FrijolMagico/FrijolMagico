import { describe, expect, mock, test } from 'bun:test'

import { FEATURED_ARTISTS_CACHE_TAG } from '@frijolmagico/cache-tags'

let cacheOptions: unknown
const unstableCacheMock = mock(
  (
    callback: () => Promise<unknown>,
    _keyParts: string[],
    options: unknown
  ) => {
    cacheOptions = options
    return callback
  }
)

mock.module('next/cache', () => ({ unstable_cache: unstableCacheMock }))

const { FEATURED_ARTISTS_QUERY } = await import('./getFeaturedArtists')

describe('FEATURED_ARTISTS_QUERY', () => {
  test('resolves featured artist names from the primary pseudonym association', () => {
    expect(FEATURED_ARTISTS_QUERY).toContain(
      'primary_pseudonym.pseudonimo AS pseudonimo'
    )
    expect(FEATURED_ARTISTS_QUERY).toContain(
      'LEFT JOIN artista_pseudonimo_principal app ON app.artista_id = a.id'
    )
    expect(FEATURED_ARTISTS_QUERY).toContain(
      'LEFT JOIN artista_pseudonimo primary_pseudonym ON primary_pseudonym.id = app.pseudonimo_id'
    )
    expect(FEATURED_ARTISTS_QUERY).not.toContain('ac.pseudonimo_id')
  })

  test('configures tagged caching with a seven-day revalidation interval', () => {
    expect(cacheOptions).toEqual({
      tags: [FEATURED_ARTISTS_CACHE_TAG],
      revalidate: 7 * 24 * 60 * 60
    })
    expect(unstableCacheMock).toHaveBeenCalledTimes(1)
  })
})
