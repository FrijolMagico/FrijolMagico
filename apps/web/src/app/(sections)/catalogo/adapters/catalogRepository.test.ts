import { beforeEach, describe, expect, mock, test } from 'bun:test'

import { executeQueryMock } from '@/test-utils/mockDatabase'

const getDataSourceMock = mock(() => 'database' as 'database' | 'local')

mock.module('@/infra/config/dataSourceConfig', () => ({
  getDataSource: getDataSourceMock
}))
mock.module('next/cache', () => ({ cacheTag: mock() }))

import { catalogRepository } from './catalogRepository'
import {
  CATALOG_BASE_QUERY,
  CATALOG_EDITION_DATES_QUERY,
  CATALOG_PARTICIPATION_QUERY
} from './queries/catalog-batched'

beforeEach(() => {
  executeQueryMock.mockReset()
  executeQueryMock.mockResolvedValue({ data: [], error: null })
  getDataSourceMock.mockReturnValue('database')
})

describe('catalogRepository', () => {
  test('executes exactly three set-based SQL queries and composes matching reads', async () => {
    executeQueryMock.mockImplementation(async (query) => {
      if (query === CATALOG_BASE_QUERY) {
        return {
          data: [{
            id: 41,
            name: 'Ada Artist',
            slug: 'ada-artist',
            email: null,
            rrss: null,
            city: null,
            country: null,
            bio: null,
            orden: '1',
            destacado: 0,
            avatar: null,
            collective: null
          }],
          error: null
        }
      }
      if (query === CATALOG_PARTICIPATION_QUERY) {
        return {
          data: [{
            artist_id: 41,
            participation_id: 71,
            event_id: 81,
            edition_id: 91,
            edition: '2024',
            event: 'Festival Test',
            participation_type: 'exhibicion',
            category: 'ilustracion',
            via_collective: null
          }],
          error: null
        }
      }
      return { data: [{ edition_id: 91, date: '2024-06-15' }], error: null }
    })

    const artists = await catalogRepository()

    expect(executeQueryMock).toHaveBeenCalledTimes(3)
    expect(executeQueryMock.mock.calls.map(([query]) => query)).toEqual([
      CATALOG_BASE_QUERY,
      CATALOG_PARTICIPATION_QUERY,
      CATALOG_EDITION_DATES_QUERY
    ])
    expect(artists).toMatchObject([{
      id: '41',
      name: 'Ada Artist',
      editions: [{
        evento_id: 81,
        edicion: '2024',
        evento: 'Festival Test',
        año: '2024',
        tipo_participacion: 'exhibicion',
        categoria: 'ilustracion',
        via_agrupacion: null
      }]
    }])
  })

  test('falls back to mock data when any cached query reports an error', async () => {
    executeQueryMock.mockImplementation(async (query) => ({
      data: [],
      error: query === CATALOG_EDITION_DATES_QUERY ? new Error('date query failed') : null
    }))

    const artists = await catalogRepository()

    expect(artists.length).toBeGreaterThan(0)
    expect(executeQueryMock).toHaveBeenCalledTimes(3)
  })
})
