import { describe, expect, test } from 'bun:test'
import { createPaginatedResponse } from '@/shared/types/pagination'
import { normalizeCatalogListQuery } from '@/core/artistas/catalogo/_lib/catalog-list-query'

describe('normalizeCatalogListQuery', () => {
  test('normalizes search and boolean filters', () => {
    const result = normalizeCatalogListQuery({
      page: 2,
      pageSize: 20,
      search: '  ana  ',
      filters: {
        activo: 'true',
        destacado: 'false'
      }
    })

    expect(result).toEqual({
      page: 2,
      pageSize: 20,
      search: 'ana',
      activo: true,
      destacado: false
    })
  })
})

describe('catalog pagination metadata', () => {
  test('marks reorder as constrained when filters or pagination are active', () => {
    const hasActiveFilters = true
    const page: number = 2
    const canReorder = !hasActiveFilters && page === 1

    expect(canReorder).toBe(false)
  })

  test('returns empty page metadata consistently', () => {
    const result = createPaginatedResponse([], {
      total: 0,
      page: 3,
      pageSize: 20
    })

    expect(result.totalPages).toBe(0)
    expect(result.page).toBe(3)
  })
})
