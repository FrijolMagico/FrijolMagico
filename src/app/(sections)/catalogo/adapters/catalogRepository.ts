import { executeQuery } from '@/infra/services/tursoClient'
import { getDataSource } from '@/infra/config/dataSourceConfig'

import { mapCatalogArtists } from './mappers/catalogMapper'
import { getDataFromCatalogMock } from './mocks/catalogData.mock'

import type { CatalogArtist } from '../types/catalog'
import type { RawCatalogResult } from '../types/catalogDB'
import { CATALOG_QUERY } from './queries/catalogoQuery'

export async function catalogRepository(): Promise<CatalogArtist[]> {
  const source = getDataSource({ prod: 'database' })

  if (source === 'local' || source === 'database') {
    const { data, error } = await executeQuery<RawCatalogResult>(
      CATALOG_QUERY,
      [],
    )

    if (error) {
      console.warn(
        '⚠️ Database query failed, falling back to mock data:',
        error.message,
      )
      return getDataFromCatalogMock()
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No data found in database, falling back to mock data')
      return getDataFromCatalogMock()
    }

    const parsedData = data.map((row: RawCatalogResult) =>
      JSON.parse(row.resultado),
    )
    return mapCatalogArtists(parsedData)
  }

  throw new Error(`Unsupported data source: ${source}`)
}
