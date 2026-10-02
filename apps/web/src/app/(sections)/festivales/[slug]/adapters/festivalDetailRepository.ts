import { executeQuery } from '@frijolmagico/database/client'
import { getDataSource } from '@/infra/config/dataSourceConfig'

import { mapFestivalDetail } from './mappers/festivalDetailMapper'
import { FESTIVAL_DETAIL_QUERY } from './queries/festivalDetailQuery'

import type { FestivalDetail, RawFestivalDetail } from '../../types/festival'

export async function festivalDetailRepository(
  slug: string
): Promise<FestivalDetail | null> {
  if (!slug.trim()) {
    return null
  }

  const source = getDataSource({ prod: 'database' })

  if (source === 'local' || source === 'database') {
    const { data, error } = await executeQuery<RawFestivalDetail>(
      FESTIVAL_DETAIL_QUERY,
      [slug]
    )

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      return null
    }

    try {
      const raw = JSON.parse(data[0].resultado) as FestivalDetail

      if (raw.slug) {
        return mapFestivalDetail(raw)
      }

      return null
    } catch {
      console.warn('⚠️ Unable to map festival detail query result')
      return null
    }
  }

  throw new Error(`Unsupported data source: ${source}`)
}
