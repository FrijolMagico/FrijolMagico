import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG } from '@frijolmagico/cache-tags'
import type { ActiveFestivalDisplay } from '@frijolmagico/database/active-festival-display'

const cacheTag = mock(() => {})
const cacheLife = mock(() => {})
const rollback = mock(async () => {})
const tx = { select: mock(async () => null), rollback }
const transaction = mock(async (callback: (query: typeof tx) => Promise<unknown>) => {
  try {
    return await callback(tx)
  } catch (error) {
    await tx.rollback()
    throw error
  }
})
const query = { transaction }
const getActiveFestivalDisplay = mock(
  async (query: typeof tx): Promise<ActiveFestivalDisplay | null> => {
    await query.select()
    await query.select()
    return null
  }
)
mock.module('next/cache', () => ({ cacheTag, cacheLife }))
mock.module('@frijolmagico/database/orm', () => ({ db: query }))
mock.module('@frijolmagico/database/active-festival-display', () => ({
  getActiveFestivalDisplay
}))

const { getActiveFestivalDisplay: getCachedActiveFestivalDisplay } = await import(
  './getActiveFestivalDisplay'
)

beforeEach(() => {
  cacheTag.mockClear()
  cacheLife.mockClear()
  transaction.mockClear()
  tx.select.mockClear()
  rollback.mockClear()
  getActiveFestivalDisplay.mockClear()
})

describe('getActiveFestivalDisplay remote reader', () => {
  test('uses only the dedicated tag and delegates to the shared projection', async () => {
    const display: ActiveFestivalDisplay = {
      id: 1,
      slug: 'festival-i',
      event_name: 'Festival',
      edition_number: 'I',
      start_date: '2026-10-01',
      end_date: '2026-10-02',
      days: []
    }
    getActiveFestivalDisplay.mockImplementationOnce(async (query) => {
      await query.select()
      await query.select()
      return display
    })

    await expect(getCachedActiveFestivalDisplay()).resolves.toBe(display)
    expect(transaction).toHaveBeenCalledTimes(1)
    expect(getActiveFestivalDisplay).toHaveBeenCalledWith(tx)
    expect(tx.select).toHaveBeenCalledTimes(2)
    expect(rollback).not.toHaveBeenCalled()
    expect(cacheTag).toHaveBeenCalledWith(FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG)
    expect(cacheTag).toHaveBeenCalledTimes(1)
    expect(cacheLife).toHaveBeenCalledWith({ stale: 5 * 60, revalidate: Infinity, expire: Infinity })
  })

  test('preserves the null projection', async () => {
    getActiveFestivalDisplay.mockResolvedValueOnce(null)
    await expect(getCachedActiveFestivalDisplay()).resolves.toBeNull()
  })

  test('propagates projection failure through the read transaction', async () => {
    const failure = new Error('projection failed')
    getActiveFestivalDisplay.mockImplementationOnce(async (query) => {
      await query.select()
      await query.select()
      throw failure
    })

    await expect(getCachedActiveFestivalDisplay()).rejects.toBe(failure)
    expect(transaction).toHaveBeenCalledTimes(1)
    expect(getActiveFestivalDisplay).toHaveBeenCalledWith(tx)
    expect(tx.select).toHaveBeenCalledTimes(2)
    expect(rollback).toHaveBeenCalledTimes(1)
  })
})
