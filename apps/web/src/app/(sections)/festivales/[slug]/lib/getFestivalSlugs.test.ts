import { beforeEach, describe, expect, test } from 'bun:test'

import { executeQueryMock } from '@/test-utils/mockDatabase'

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

  test('falls back to mock slugs when query fails', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [],
      error: new Error('DB error')
    })

    const slugs = await getFestivalSlugs()

    // Should fall back to mock data slugs
    expect(slugs.length).toBeGreaterThan(0)
    expect(slugs).toContain('edicion-xv-1')
  })
})
