import { executeQuery } from '@frijolmagico/database/client'
import { getDataSource } from '@/infra/config/dataSourceConfig'

import { mapFestivalDetail } from './mappers/festivalDetailMapper'
import { FESTIVAL_DETAIL_QUERY } from './queries/festivalDetailQuery'
import { getFestivalDetailMock } from './mocks/festivalDetailData.mock'

import type { FestivalDetail, RawFestivalDetail } from '../../types/festival'

export async function festivalDetailRepository(
  slug: string
): Promise<FestivalDetail | null> {
  if (!slug.trim()) {
    return null
  }

  const source = getDataSource({ prod: 'database' })

  if (source === 'local' || source === 'database') {
    try {
      const { data, error } = await executeQuery<RawFestivalDetail>(
        FESTIVAL_DETAIL_QUERY,
        [slug]
      )

      if (!error && data && data.length > 0) {
        const raw = JSON.parse(data[0].resultado) as FestivalDetail

        if (raw.slug) {
          return mapFestivalDetail(raw)
        }
      }
    } catch {
      console.warn('⚠️ Unable to load festival detail from database')
      return null
    }

    console.warn('⚠️ Unable to load festival detail from database')
    return null
  }

  return source === 'mock' ? (getFestivalDetailMock(slug) ?? null) : null
}
