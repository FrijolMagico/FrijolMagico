import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG } from '@frijolmagico/cache-tags'
import type { ActiveFestivalDisplay } from '@frijolmagico/database/active-festival-display'

import { executeQueryMock } from '@/test-utils/mockDatabase'

const cacheTag = mock(() => {})
const cacheLife = mock(() => {})
mock.module('next/cache', () => ({ cacheTag, cacheLife }))

const { getActiveFestivalDisplay } = await import('./getActiveFestivalDisplay')

beforeEach(() => {
  cacheTag.mockClear()
  cacheLife.mockClear()
  executeQueryMock.mockReset()
})

describe('getActiveFestivalDisplay remote reader', () => {
  test('uses one raw query and preserves the cached display contract', async () => {
    const display: ActiveFestivalDisplay = {
      id: 1,
      slug: 'festival-i',
      event_name: 'Festival',
      edition_number: 'I',
      start_date: '2026-10-01',
      end_date: '2026-10-02',
      days: [
        { fecha: '2026-10-01', lugar: null },
        { fecha: '2026-10-02', lugar: 'Plaza' }
      ]
    }
    executeQueryMock.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          slug: 'festival-i',
          event_name: 'Festival',
          edition_number: 'I',
          start_date: '2026-10-01',
          end_date: '2026-10-02',
          fecha: '2026-10-01',
          lugar: null
        },
        {
          id: 1,
          slug: 'festival-i',
          event_name: 'Festival',
          edition_number: 'I',
          start_date: '2026-10-01',
          end_date: '2026-10-02',
          fecha: '2026-10-02',
          lugar: 'Plaza'
        }
      ],
      error: null
    })

    await expect(getActiveFestivalDisplay()).resolves.toEqual(display)
    expect(executeQueryMock).toHaveBeenCalledTimes(1)
    expect(executeQueryMock.mock.calls[0]?.[0]).toContain(
      'WITH selected_edition AS'
    )
    expect(cacheTag).toHaveBeenCalledWith(FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG)
    expect(cacheLife).toHaveBeenCalledWith({
      stale: 5 * 60,
      revalidate: Infinity,
      expire: Infinity
    })
  })

  test('returns null when there is no eligible edition', async () => {
    executeQueryMock.mockResolvedValueOnce({ data: [], error: null })

    await expect(getActiveFestivalDisplay()).resolves.toBeNull()
  })

  test('throws query errors instead of treating them as no active festival', async () => {
    const failure = new Error('Database connection failed')
    executeQueryMock.mockResolvedValueOnce({ data: [], error: failure })

    await expect(getActiveFestivalDisplay()).rejects.toBe(failure)
  })
})
