import { describe, expect, test } from 'bun:test'

import { artistQueryParamsSchema } from '@/core/artistas/_schemas/query-params.schema'
import { createPaginatedResponse } from '@/shared/types/pagination'

describe('artistQueryParamsSchema', () => {
  test('accepts flat nuqs params for server queries', () => {
    const result = artistQueryParamsSchema.parse({
      page: 2,
      limit: 20,
      search: 'Ana',
      estado: 3,
      pais: 'Chile',
      ciudad: 'Santiago'
    })

    expect(result).toEqual({
      page: 2,
      limit: 20,
      search: 'Ana',
      estado: 3,
      pais: 'Chile',
      ciudad: 'Santiago'
    })
  })

  test('requires typed values after nuqs deserialization', () => {
    expect(() =>
      artistQueryParamsSchema.parse({
        page: 1,
        limit: 20,
        search: '',
        estado: 'foo',
        pais: null,
        ciudad: null
      })
    ).toThrow()
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
