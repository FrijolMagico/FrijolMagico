import { describe, expect, test } from 'bun:test'
import {
  createAdminListFilterParamName,
  ADMIN_LIST_CONTRACT_EXAMPLE
} from '@/shared/lib/admin-list-contract'
import { parseAdminListParams } from '@/shared/lib/admin-list-params'
import type { ArtistListQueryFilters } from '@/shared/types/admin-list-filters'
import { createPaginatedResponse } from '@/shared/types/pagination'

describe('parseAdminListParams', () => {
  test('parses valid params and allowed filters', () => {
    const params = new URLSearchParams(
      'page=2&limit=20&search=ana&filter[statusId]=3&filter[country]=Chile'
    )

    const result = parseAdminListParams<ArtistListQueryFilters>(params, {
      allowedFilters: ['statusId', 'country', 'city']
    })

    expect(result).toEqual({
      page: 2,
      pageSize: 20,
      search: 'ana',
      filters: {
        statusId: '3',
        country: 'Chile'
      }
    })
  })

  test('falls back to defaults for invalid params', () => {
    const result = parseAdminListParams({
      page: '0',
      limit: '-3',
      search: undefined,
      [createAdminListFilterParamName('statusId')]: '2'
    })

    expect(result).toEqual({
      page: 1,
      pageSize: 20,
      search: '',
      filters: {
        statusId: '2'
      }
    })
  })

  test('ignores unknown and empty filters', () => {
    const result = parseAdminListParams<ArtistListQueryFilters>(
      {
        page: '3',
        [createAdminListFilterParamName('country')]: 'Argentina',
        [createAdminListFilterParamName('unknown')]: 'ignored',
        [createAdminListFilterParamName('city')]: ' '
      },
      {
        allowedFilters: ['country', 'city', 'statusId']
      }
    )

    expect(result).toEqual({
      page: 3,
      pageSize: 20,
      search: '',
      filters: {
        country: 'Argentina'
      }
    })
  })
})

describe('admin list contract metadata', () => {
  test('documents the shared query contract example', () => {
    expect(ADMIN_LIST_CONTRACT_EXAMPLE).toBe(
      '?page=1&limit=20&search=texto&filter[campo]=valor'
    )
  })

  test('returns zero total pages when there are no results', () => {
    const result = createPaginatedResponse([], {
      total: 0,
      page: 3,
      pageSize: 10
    })

    expect(result).toEqual({
      data: [],
      total: 0,
      page: 3,
      pageSize: 10,
      totalPages: 0
    })
  })

  test('returns non-empty metadata consistently', () => {
    const result = createPaginatedResponse(Array.from({ length: 20 }), {
      total: 45,
      page: 2,
      pageSize: 20
    })

    expect(result).toEqual({
      data: Array.from({ length: 20 }),
      total: 45,
      page: 2,
      pageSize: 20,
      totalPages: 3
    })
  })

  test('preserves requested page when it exceeds available pages', () => {
    const result = createPaginatedResponse([], {
      total: 10,
      page: 3,
      pageSize: 10
    })

    expect(result.totalPages).toBe(1)
    expect(result.page).toBe(3)
  })
})
