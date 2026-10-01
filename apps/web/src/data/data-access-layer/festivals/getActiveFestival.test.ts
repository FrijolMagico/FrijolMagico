import { beforeEach, describe, expect, mock, test } from 'bun:test'

import { FESTIVAL_CRITICAL_CACHE_TAG } from '@frijolmagico/cache-tags'

import { executeQueryMock } from '@/test-utils/mockDatabase'

import { getActiveFestival } from './getActiveFestival'

const cacheTagMock = mock((_tag: string) => {})

mock.module('next/cache', () => ({
  cacheLife: mock(() => {}),
  cacheTag: cacheTagMock
}))

beforeEach(() => {
  executeQueryMock.mockReset()
  cacheTagMock.mockClear()
})

describe('getActiveFestival', () => {
  test('returns data when a festival is active', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [
        {
          id: 10,
          slug: 'edicion-15-1',
          event_name: 'Festival Frijol Mágico',
          edition_number: 'XV',
          start_date: '2026-10-09',
          end_date: '2026-10-11'
        }
      ],
      error: null
    })

    const result = await getActiveFestival()

    expect(result.data).toHaveLength(1)
    expect(result.data![0].slug).toBe('edicion-15-1')
    expect(result.data![0].event_name).toBe('Festival Frijol Mágico')
    expect(cacheTagMock.mock.calls.map(([tag]) => tag)).toEqual([
      FESTIVAL_CRITICAL_CACHE_TAG
    ])
  })

  test('returns empty data when no festival is active', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [],
      error: null
    })

    const result = await getActiveFestival()

    expect(result.data).toHaveLength(0)
  })

  test('handles query error', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [],
      error: new Error('Database connection failed')
    })

    const result = await getActiveFestival()

    expect(result.error).toBeInstanceOf(Error)
    expect(result.error!.message).toBe('Database connection failed')
  })
})
