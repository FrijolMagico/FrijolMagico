import { getDataFromCMS } from '@/infra/getDataFromCMS'
import { getDataSource } from '@/infra/config/dataSourceConfig'

import { getDataFromMock } from './mocks/approvedArtistsData.mock'

import { APPROVED_ARTISTS_CONFIG } from '../constants/approvedArtistsConfig'

import type { ApprovedArtist } from '../types'

export async function approvedArtistsRepository(): Promise<ApprovedArtist[]> {
  const source = getDataSource({ prod: 'cms' })

  if (source === 'mock') {
    return getDataFromMock()
  }

  const data = await getDataFromCMS<ApprovedArtist>(APPROVED_ARTISTS_CONFIG)

  if (!data) {
    throw new Error(
      'Data not found or an error ocurred while fetching approved artists',
    )
  }

  return data as ApprovedArtist[]
}
