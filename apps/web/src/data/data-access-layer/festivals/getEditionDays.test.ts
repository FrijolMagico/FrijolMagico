import { beforeEach, describe, expect, mock, test } from 'bun:test'

import { executeQueryMock } from '@/test-utils/mockDatabase'

import { getEditionDays } from './getEditionDays'

mock.module('next/cache', () => ({
  cacheTag: mock(() => {})
}))

beforeEach(() => {
  executeQueryMock.mockReset()
})

describe('getEditionDays', () => {
  test('returns days with venue for an edition', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [
        { fecha: '2026-10-09', lugar: 'Mall VIVO Coquimbo' },
        { fecha: '2026-10-10', lugar: 'Mall VIVO Coquimbo' },
        { fecha: '2026-10-11', lugar: 'La Serena' }
      ],
      error: null
    })

    const result = await getEditionDays(10)

    expect(result.data).toHaveLength(3)
    expect(result.data![0].fecha).toBe('2026-10-09')
    expect(result.data![0].lugar).toBe('Mall VIVO Coquimbo')
  })

  test('returns days with null venue when no place is set', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [{ fecha: '2026-10-09', lugar: null }],
      error: null
    })

    const result = await getEditionDays(10)

    expect(result.data).toHaveLength(1)
    expect(result.data![0].lugar).toBeNull()
  })

  test('returns empty data when edition has no days', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [],
      error: null
    })

    const result = await getEditionDays(10)

    expect(result.data).toHaveLength(0)
  })

  test('passes edition ID as query parameter', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [],
      error: null
    })

    await getEditionDays(42)

    // Verify the query includes the edition ID parameter
    expect(executeQueryMock).toHaveBeenCalledTimes(1)
    const [, params] = executeQueryMock.mock.calls[0]
    expect(params).toEqual([42])
  })

  test('handles query error', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [],
      error: new Error('Query failed')
    })

    const result = await getEditionDays(10)

    expect(result.error).toBeInstanceOf(Error)
    expect(result.error!.message).toBe('Query failed')
  })
})
