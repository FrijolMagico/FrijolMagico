import { beforeEach, describe, expect, mock, test } from 'bun:test'

import { FEATURED_ARTISTS_CACHE_TAG } from '@frijolmagico/cache-tags'

let cacheTagValue: string | undefined
let cacheLifeProfile: unknown
const cacheTagMock = mock((tag: string) => {
  cacheTagValue = tag
})
const cacheLifeMock = mock((profile: unknown) => {
  cacheLifeProfile = profile
})
const executeQueryMock = mock(
  async (
    query: string,
    params: unknown[]
  ): Promise<{ data: unknown; error: Error | null }> => {
    void query
    void params
    return { data: [] as unknown[], error: null }
  }
)

mock.module('next/cache', () => ({
  cacheTag: cacheTagMock,
  cacheLife: cacheLifeMock
}))
mock.module('@frijolmagico/database/client', () => ({
  executeQuery: executeQueryMock
}))

const { FEATURED_ARTISTS_QUERY, getFeaturedArtists } = await import('./getFeaturedArtists')

const featuredArtist = {
  pseudonimo: 'Canela',
  slug: 'canela',
  rrss: 'https://instagram.com/canela',
  imagen_url: '/canela.png'
}

beforeEach(() => {
  cacheTagValue = undefined
  cacheLifeProfile = undefined
  cacheTagMock.mockClear()
  cacheLifeMock.mockClear()
  executeQueryMock.mockReset()
  executeQueryMock.mockResolvedValue({ data: [featuredArtist], error: null })
})

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
})

describe('getFeaturedArtists', () => {
  test('returns valid artists and applies the tagged seven-day cache profile', async () => {
    await expect(getFeaturedArtists()).resolves.toEqual([featuredArtist])
    expect(cacheTagValue).toBe(FEATURED_ARTISTS_CACHE_TAG)
    expect(cacheLifeProfile).toEqual({
      stale: 5 * 60,
      revalidate: 7 * 24 * 60 * 60,
      expire: Infinity
    })
    expect(cacheTagMock).toHaveBeenCalledTimes(1)
    expect(cacheLifeMock).toHaveBeenCalledTimes(1)
    expect(executeQueryMock).toHaveBeenCalledWith(FEATURED_ARTISTS_QUERY, [])
  })

  test('throws a returned database error', async () => {
    const databaseError = new Error('database unavailable')
    executeQueryMock.mockResolvedValue({ data: [featuredArtist], error: databaseError })

    await expect(getFeaturedArtists()).rejects.toMatchObject({
      cause: databaseError
    })
  })

  test('propagates a rejected query', async () => {
    const queryError = new Error('query rejected')
    executeQueryMock.mockRejectedValue(queryError)

    await expect(getFeaturedArtists()).rejects.toBe(queryError)
  })

  test('throws when data is null', async () => {
    executeQueryMock.mockResolvedValue({ data: null, error: null })

    await expect(getFeaturedArtists()).rejects.toThrow()
  })

  test('throws when data is undefined', async () => {
    executeQueryMock.mockResolvedValue({ data: undefined, error: null })

    await expect(getFeaturedArtists()).rejects.toThrow()
  })

  test('throws when data is empty', async () => {
    executeQueryMock.mockResolvedValue({ data: [], error: null })

    await expect(getFeaturedArtists()).rejects.toThrow()
  })
})
