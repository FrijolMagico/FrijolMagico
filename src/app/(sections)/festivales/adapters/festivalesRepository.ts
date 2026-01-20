import { executeQuery } from '@/infra/services/tursoClient'
import { getDataSource } from '@/infra/config/dataSourceConfig'
import { mapFestivalEdicion } from './mappers/festivalMapper'
import { getFestivalesMock } from './mocks/festivalesData.mock'

import type { FestivalEdicion, RawFestivalEdicion } from '../types/festival'

const FESTIVALES_QUERY = `
SELECT json_object(
    'evento', json_object(
        'nombre', e.nombre,
        'slug', e.slug,
        'edicion', ee.numero_edicion,
        'edicion_nombre', ee.nombre,
        'poster_url', ee.poster_url,
        'dias', COALESCE((
            SELECT json_group_array(
                json_object(
                    'fecha', eed.fecha,
                    'hora_inicio', eed.hora_inicio,
                    'hora_fin', eed.hora_fin,
                    'modalidad', eed.modalidad,
                    'lugar', CASE
                        WHEN l.id IS NOT NULL THEN json_object(
                            'nombre', l.nombre,
                            'direccion', l.direccion
                        )
                        ELSE NULL
                    END
                )
            )
            FROM evento_edicion_dia eed
            LEFT JOIN lugar l ON eed.lugar_id = l.id
            WHERE eed.evento_edicion_id = ee.id
            ORDER BY eed.fecha
        ), '[]')
    ),
    'resumen', json_object(
        'total_participantes', json_object(
            'exponentes', (
                SELECT COUNT(DISTINCT COALESCE(pe.agrupacion_id, pe.artista_id))
                FROM participante_exposicion pe
                WHERE pe.evento_edicion_id = ee.id
            ),
            'talleres', (
                SELECT COUNT(DISTINCT pa.artista_id)
                FROM participante_actividad pa
                JOIN tipo_actividad ta ON pa.tipo_actividad_id = ta.id
                WHERE pa.evento_edicion_id = ee.id
                  AND LOWER(ta.slug) LIKE '%taller%'
            ),
            'musica', (
                SELECT COUNT(DISTINCT COALESCE(pa.agrupacion_id, pa.artista_id))
                FROM participante_actividad pa
                JOIN tipo_actividad ta ON pa.tipo_actividad_id = ta.id
                WHERE pa.evento_edicion_id = ee.id
                  AND (LOWER(ta.slug) LIKE '%music%' OR LOWER(ta.slug) LIKE '%banda%')
            )
        ),
        'por_disciplina', COALESCE((
            SELECT json_group_object(d.slug, cnt)
            FROM (
                SELECT pe.disciplina_id, COUNT(DISTINCT COALESCE(pe.agrupacion_id, pe.artista_id)) as cnt
                FROM participante_exposicion pe
                WHERE pe.evento_edicion_id = ee.id
                GROUP BY pe.disciplina_id
            ) sub
            JOIN disciplina d ON sub.disciplina_id = d.id
        ), '{}')
    )
) as resultado
FROM evento e
JOIN evento_edicion ee ON e.id = ee.evento_id
ORDER BY (
    SELECT MIN(eed.fecha)
    FROM evento_edicion_dia eed
    WHERE eed.evento_edicion_id = ee.id
) DESC
`

export async function festivalesRepository(): Promise<FestivalEdicion[]> {
  const source = getDataSource({ prod: 'database' })

  if (source === 'mock') {
    const mockData = getFestivalesMock()
    return mockData
      .sort((a, b) => {
        const dateA = a.evento.dias[0]?.fecha || ''
        const dateB = b.evento.dias[0]?.fecha || ''
        return dateB.localeCompare(dateA)
      })
      .map(mapFestivalEdicion)
  }

  const { data, error } = await executeQuery<RawFestivalEdicion>(
    FESTIVALES_QUERY,
    [],
  )

  if (error) {
    throw new Error(`Error fetching festivales data: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return []
  }

  return data.map((row) => {
    const raw = JSON.parse(row.resultado) as FestivalEdicion
    return mapFestivalEdicion(raw)
  })
}
