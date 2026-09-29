import { getDataSource } from '@/infra/config/dataSourceConfig'

import { mapCatalogArtists } from './mappers/catalogMapper'
import { getDataFromCatalogMock } from './mocks/catalogData.mock'

import type { CatalogArtist } from '../types/catalog'
import { composeCatalogRows } from './queries/catalog-batched'
import type {
  CatalogBaseRow,
  EditionDateRow,
  ParticipationRow
} from './queries/catalog-batched'
import {
  getCachedCatalogBaseRows,
  getCachedCatalogEditionDateRows,
  getCachedCatalogParticipationRows
} from './queries/catalog-cache'

export async function catalogRepository(): Promise<CatalogArtist[]> {
  const source = getDataSource({ prod: 'database', dev: 'local' })

  if (source === 'local' || source === 'database') {
    let rows: [CatalogBaseRow[], ParticipationRow[], EditionDateRow[]]
    try {
      rows = await Promise.all([
        getCachedCatalogBaseRows(),
        getCachedCatalogParticipationRows(),
        getCachedCatalogEditionDateRows()
      ])
    } catch (error) {
      console.warn(
        '⚠️ Database query failed, falling back to mock data:',
        error instanceof Error ? error.message : error
      )
      return getDataFromCatalogMock()
    }

    const [baseRows, participationRows, editionDateRows] = rows

    if (baseRows.length === 0) {
      console.warn('⚠️ No data found in database, falling back to mock data')
      return getDataFromCatalogMock()
    }

    return mapCatalogArtists(
      composeCatalogRows(baseRows, participationRows, editionDateRows)
    )
  }

  throw new Error(`Unsupported data source: ${source}`)
}
