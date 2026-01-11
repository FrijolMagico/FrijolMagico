import { getDataFromCMS } from '@/infra/getDataFromCMS'
import { getDataSource } from '@/infra/config/dataSourceConfig'

import { getDataFromCatalogMock } from './mocks/catalogData.mock'

import { CATALOG_CONFIG } from '../constants/catalogConfig'

import type { RawCatalogArtist } from '../types/catalog'

export async function catalogRepository(): Promise<RawCatalogArtist[]> {
  const source = getDataSource({ prod: 'cms' })

  if (source === 'mock') {
    return getDataFromCatalogMock()
  }

  const data = await getDataFromCMS<RawCatalogArtist>(CATALOG_CONFIG)

  if (!data) {
    throw new Error(
      'Data not found or an error occurred while fetching catalog info.',
    )
  }

  return data as RawCatalogArtist[]
}
