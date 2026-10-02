import { describe, expect, mock, test } from 'bun:test'

import { FESTIVALES_CACHE_TAG } from '@frijolmagico/cache-tags'

const cacheTagMock = mock<(tag: string) => void>(() => {})
const festivalesRepositoryMock = mock(async () => [])

mock.module('next/cache', () => ({
  cacheLife: mock(() => {}),
  cacheTag: cacheTagMock
}))
mock.module('../adapters/festivalesRepository', () => ({
  festivalesRepository: festivalesRepositoryMock
}))

const { getFestivalesData } = await import('./getFestivalesData')

describe('getFestivalesData cache tags', () => {
  test('uses only the festival discovery tag', async () => {
    cacheTagMock.mockClear()

    await getFestivalesData()

    expect(cacheTagMock.mock.calls.map(([tag]) => tag)).toEqual([
      FESTIVALES_CACHE_TAG
    ])
  })
})
