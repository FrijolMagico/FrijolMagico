import { executeQuery } from '@/infra/services/tursoClient'
import { getDataSource } from '@/infra/config/dataSourceConfig'
import { mapFestivalEdicion } from './mappers/festivalMapper'
import { getFestivalesMock } from './mocks/festivalesData.mock'

import type { FestivalEdicion, RawFestivalEdicion } from '../types/festival'
import { FESTIVALES_QUERY } from './queries/festivalesQuery'

export async function festivalesRepository(): Promise<FestivalEdicion[]> {
  const source = getDataSource({ prod: 'database' })

  if (source === 'local' || source === 'database') {
    const { data, error } = await executeQuery<RawFestivalEdicion>(
      FESTIVALES_QUERY,
      [],
    )

    if (error) {
      console.warn(
        '⚠️ Database query failed, falling back to mock data:',
        error.message,
      )
      return getFestivalesMock().map(mapFestivalEdicion)
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No data found in database, falling back to mock data')
      return getFestivalesMock().map(mapFestivalEdicion)
    }

    return data.map((row: RawFestivalEdicion) => {
      const raw = JSON.parse(row.resultado) as FestivalEdicion
      return mapFestivalEdicion(raw)
    })
  }

  throw new Error(`Unsupported data source: ${source}`)
}
