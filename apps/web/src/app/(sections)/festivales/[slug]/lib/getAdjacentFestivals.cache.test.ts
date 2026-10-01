import { describe, expect, mock, test } from 'bun:test'

import { FESTIVALES_CACHE_TAG } from '@frijolmagico/cache-tags'

const cacheTagMock = mock((_tag: string) => {})
const adjacentFestivalsRepositoryMock = mock(async () => ({
  prev: null,
  next: null
}))

mock.module('next/cache', () => ({
  cacheLife: mock(() => {}),
  cacheTag: cacheTagMock
}))
mock.module('../adapters/adjacentFestivalsRepository', () => ({
  adjacentFestivalsRepository: adjacentFestivalsRepositoryMock
}))

const { getAdjacentFestivals } = await import('./getAdjacentFestivals')

describe('getAdjacentFestivals cache tags', () => {
  test('uses only the festival discovery tag', async () => {
    cacheTagMock.mockClear()

    await getAdjacentFestivals('edicion-15-1')

    expect(cacheTagMock.mock.calls.map(([tag]) => tag)).toEqual([
      FESTIVALES_CACHE_TAG
    ])
  })
})
