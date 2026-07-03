import { executeQuery } from '@frijolmagico/database/client'
import { getDataSource } from '@/infra/config/dataSourceConfig'

import { ADJACENT_FESTIVALS_QUERY } from './queries/adjacentFestivalsQuery'

export interface AdjacentFestivalRow {
  direction: string
  slug: string
  numero_edicion: string
  edicion_nombre: string | null
  evento_nombre: string
}

export interface AdjacentFestival {
  slug: string
  numero_edicion: string
  edicion_nombre: string | null
  evento_nombre: string
}

export interface AdjacentFestivalsResult {
  prev: AdjacentFestival | null
  next: AdjacentFestival | null
}

export async function adjacentFestivalsRepository(
  slug: string
): Promise<AdjacentFestivalsResult> {
  if (!slug.trim()) {
    return { prev: null, next: null }
  }

  const source = getDataSource({ prod: 'database' })

  if (source === 'local' || source === 'database') {
    const { data, error } = await executeQuery<AdjacentFestivalRow>(
      ADJACENT_FESTIVALS_QUERY,
      [slug]
    )

    if (!error && data && data.length > 0) {
      const prevRow = data.find((r) => r.direction === 'prev')
      const nextRow = data.find((r) => r.direction === 'next')

      return {
        prev: prevRow
          ? {
              slug: prevRow.slug,
              numero_edicion: prevRow.numero_edicion,
              edicion_nombre: prevRow.edicion_nombre,
              evento_nombre: prevRow.evento_nombre
            }
          : null,
        next: nextRow
          ? {
              slug: nextRow.slug,
              numero_edicion: nextRow.numero_edicion,
              edicion_nombre: nextRow.edicion_nombre,
              evento_nombre: nextRow.evento_nombre
            }
          : null
      }
    }

    console.warn(
      '⚠️ Database query failed for adjacent festivals, returning empty'
    )
  }

  return { prev: null, next: null }
}
