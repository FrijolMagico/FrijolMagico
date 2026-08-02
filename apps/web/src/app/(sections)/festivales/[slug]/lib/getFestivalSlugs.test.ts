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

  test('falls back to mock slugs when local DB query fails', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [],
      error: new Error('DB error')
    })

    const slugs = await getFestivalSlugs()

    expect(slugs).toEqual(['edicion-xv-1', 'edicion-3-2'])
  })

  test('falls back to mock slugs when local DB returns no rows', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [],
      error: null
    })

    const slugs = await getFestivalSlugs()

    expect(slugs).toEqual(['edicion-xv-1', 'edicion-3-2'])
  })
})
