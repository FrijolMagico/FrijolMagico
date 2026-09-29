import { executeQuery } from '@frijolmagico/database/client'
import { getDataSource } from '@/infra/config/dataSourceConfig'

import { mapCatalogArtists } from './mappers/catalogMapper'
import { getDataFromCatalogMock } from './mocks/catalogData.mock'

import type { CatalogArtist } from '../types/catalog'
import {
  CATALOG_BASE_QUERY,
  CATALOG_PARTICIPATION_QUERY,
  composeCatalogRows
} from './queries/catalog-batched'

export async function catalogRepository(): Promise<CatalogArtist[]> {
  const source = getDataSource({ prod: 'database', dev: 'local' })

  if (source === 'local' || source === 'database') {
    const [baseResult, participationResult] = await Promise.all([
      executeQuery<{
        id: number
        name: string
        slug: string | null
        email: string | null
        rrss: string | null
        city: string | null
        country: string | null
        bio: string | null
        orden: string
        destacado: number
        avatar: string | null
        collective: string | null
      }>(CATALOG_BASE_QUERY, []),
      executeQuery<{
        artist_id: number
        participation_id: number
        event_id: number
        edition_id: number
        edition: string
        event: string
        participation_type: 'exhibicion' | 'actividad'
        category: string
        via_collective: string | null
        date: string | null
      }>(CATALOG_PARTICIPATION_QUERY, [])
    ])
    const error = baseResult.error ?? participationResult.error

    if (error) {
      console.warn(
        '⚠️ Database query failed, falling back to mock data:',
        error.message
      )
      return getDataFromCatalogMock()
    }

    if (!baseResult.data || baseResult.data.length === 0) {
      console.warn('⚠️ No data found in database, falling back to mock data')
      return getDataFromCatalogMock()
    }

    return mapCatalogArtists(
      composeCatalogRows(baseResult.data, participationResult.data)
    )
  }

  throw new Error(`Unsupported data source: ${source}`)
}
