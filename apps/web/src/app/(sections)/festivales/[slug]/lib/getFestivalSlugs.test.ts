import { beforeEach, describe, expect, mock, test } from 'bun:test'

import { executeQueryMock } from '@/test-utils/mockDatabase'

// Aislar dataSourceConfig: evitar fuga de mock.module desde otros tests
mock.module('@/infra/config/dataSourceConfig', () => ({
  getDataSource: () => 'local',
  isMockMode: () => false
}))

import { getFestivalSlugs } from './getFestivalSlugs'

beforeEach(() => {
  executeQueryMock.mockReset()
})

describe('getFestivalSlugs', () => {
  test('returns slugs from query results', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [{ slug: 'edicion-15-1' }, { slug: 'edicion-14-1' }],
      error: null
    })

    const slugs = await getFestivalSlugs()

    expect(slugs).toEqual(['edicion-15-1', 'edicion-14-1'])
  })

  test('filters out null or empty slugs', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [{ slug: 'edicion-15-1' }, { slug: null }, { slug: '' }],
      error: null
    })

    const slugs = await getFestivalSlugs()

    expect(slugs).toEqual(['edicion-15-1'])
  })

  test('propagates local DB query failures', async () => {
    const failure = new Error('DB error')
    executeQueryMock.mockResolvedValueOnce({ data: [], error: failure })

    await expect(getFestivalSlugs()).rejects.toBe(failure)
  })

  test('returns an empty list when the successful query has no rows', async () => {
    executeQueryMock.mockResolvedValueOnce({ data: [], error: null })

    await expect(getFestivalSlugs()).resolves.toEqual([])
  })
})
