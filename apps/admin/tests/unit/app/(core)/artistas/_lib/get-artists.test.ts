import { describe, expect, test } from 'bun:test'
import { createPaginatedResponse } from '@/shared/types/pagination'
import { normalizeArtistListQuery } from '@/core/artistas/_lib/artist-list-query'

describe('normalizeArtistListQuery', () => {
  test('normalizes search and status filters for server queries', () => {
    const result = normalizeArtistListQuery({
      page: 2,
      pageSize: 20,
      search: '  Ana  ',
      filters: {
        statusId: '3',
        country: 'Chile',
        city: 'Santiago'
      }
    })

    expect(result).toEqual({
      page: 2,
      pageSize: 20,
      search: 'Ana',
      statusId: 3,
      country: 'Chile',
      city: 'Santiago'
    })
  })

  test('drops invalid status filters before querying', () => {
    const result = normalizeArtistListQuery({
      page: 1,
      pageSize: 20,
      search: '',
      filters: {
        statusId: 'foo'
      }
    })

    expect(result.statusId).toBeNull()
  })
})

describe('artist pagination metadata', () => {
  test('returns non-empty paginated metadata for matching artist results', () => {
    const result = createPaginatedResponse(['a', 'b', 'c'], {
      total: 45,
      page: 2,
      pageSize: 20
    })

    expect(result.total).toBe(45)
    expect(result.page).toBe(2)
    expect(result.pageSize).toBe(20)
    expect(result.totalPages).toBe(3)
    expect(result.data).toEqual(['a', 'b', 'c'])
  })

  test('preserves requested page when it exceeds available pages', () => {
    const result = createPaginatedResponse([], {
      total: 10,
      page: 3,
      pageSize: 10
    })

    expect(result).toEqual({
      data: [],
      total: 10,
      page: 3,
      pageSize: 10,
      totalPages: 1
    })
  })
})
