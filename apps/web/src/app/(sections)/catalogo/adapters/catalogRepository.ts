import { getDataSource } from '@/infra/config/dataSourceConfig'

import { mapCatalogArtists } from './mappers/catalogMapper'

import type { CatalogArtist } from '../types/catalog'
import { composeCatalogRows } from './queries/catalog-batched'
import {
  getCachedCatalogBaseRows,
  getCachedCatalogEditionDateRows,
  getCachedCatalogParticipationRows
} from './queries/catalog-cache'

export async function catalogRepository(): Promise<CatalogArtist[]> {
  const source = getDataSource({ prod: 'database', dev: 'local' })

  if (source === 'local' || source === 'database') {
    const [baseRows, participationRows, editionDateRows] = await Promise.all([
      getCachedCatalogBaseRows(),
      getCachedCatalogParticipationRows(),
      getCachedCatalogEditionDateRows()
    ])

    if (baseRows.length === 0) {
      return []
    }

    return mapCatalogArtists(
      composeCatalogRows(baseRows, participationRows, editionDateRows)
    )
  }

  throw new Error(`Unsupported data source: ${source}`)
}
