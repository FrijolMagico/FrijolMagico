import { executeQuery } from '@frijolmagico/database/client'
import { getDataSource } from '@/infra/config/dataSourceConfig'
import { mapFestivalEdicion } from './mappers/festivalMapper'

import type { FestivalEdicion, RawFestivalEdicion } from '../types/festival'
import { FESTIVALES_QUERY } from './queries/festivalesQuery'

export async function festivalesRepository(): Promise<FestivalEdicion[]> {
  const source = getDataSource({ prod: 'database', dev: 'local' })

  if (source === 'local' || source === 'database') {
    const { data, error } = await executeQuery<RawFestivalEdicion>(
      FESTIVALES_QUERY,
      []
    )

    if (error) {
      console.warn(
        '⚠️ Database query failed for festival listing:',
        error.message
      )
      return []
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No data found in database for festival listing')
      return []
    }

    return data.map((row: RawFestivalEdicion) => {
      const raw = JSON.parse(row.resultado) as FestivalEdicion
      return mapFestivalEdicion(raw)
    })
  }

  throw new Error(`Unsupported data source: ${source}`)
}
