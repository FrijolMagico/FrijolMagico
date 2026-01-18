import { executeQuery } from '@/infra/services/tursoClient'
import { getDataSource } from '@/infra/config/dataSourceConfig'

import { mapCatalogArtists } from './mappers/catalogMapper'
import { getDataFromCatalogMock } from './mocks/catalogData.mock'

import type { CatalogArtist } from '../types/catalog'
import type { RawCatalogResult } from '../types/catalogDB'

const CATALOG_QUERY = `
SELECT json_object(
  'id', a.id,
  'name', COALESCE(a.pseudonimo, a.nombre),
  'slug', a.slug,
  'email', a.correo,
  'rrss', a.rrss,
  'city', a.ciudad,
  'country', a.pais,
  'bio', ca.descripcion,
  'orden', ca.orden,
  'destacado', ca.destacado,
  'avatar', (
    SELECT ai.imagen_url
    FROM artista_imagen ai
    WHERE ai.artista_id = a.id AND ai.tipo = 'avatar'
    ORDER BY ai.orden ASC
    LIMIT 1
  ),
  'category', (
    SELECT d.slug
    FROM evento_edicion_participante eep
    JOIN participante_exposicion pe ON eep.id = pe.participante_id
    JOIN disciplina d ON pe.disciplina_id = d.id
    JOIN evento_edicion ee ON eep.evento_edicion_id = ee.id
    LEFT JOIN evento_edicion_dia eed ON ee.id = eed.evento_edicion_id
    WHERE eep.artista_id = a.id
    GROUP BY eep.id
    ORDER BY MAX(eed.fecha) DESC
    LIMIT 1
  ),
  'collective', (
    SELECT ag.nombre
    FROM evento_edicion_participante eep
    JOIN participante_exposicion pe ON eep.id = pe.participante_id
    JOIN agrupacion ag ON pe.agrupacion_id = ag.id
    JOIN evento_edicion ee ON eep.evento_edicion_id = ee.id
    LEFT JOIN evento_edicion_dia eed ON ee.id = eed.evento_edicion_id
    WHERE eep.artista_id = a.id
    GROUP BY eep.id
    ORDER BY MAX(eed.fecha) DESC
    LIMIT 1
  ),
  'collectives', COALESCE((
    SELECT json_group_array(
      json_object(
        'name', ag.nombre,
        'edicion', ee.numero_edicion,
        'evento', ev.nombre
      )
    )
    FROM evento_edicion_participante eep
    JOIN participante_exposicion pe ON eep.id = pe.participante_id
    JOIN agrupacion ag ON pe.agrupacion_id = ag.id
    JOIN evento_edicion ee ON eep.evento_edicion_id = ee.id
    JOIN evento ev ON ee.evento_id = ev.id
    WHERE eep.artista_id = a.id
  ), '[]'),
  'editions', COALESCE((
    SELECT json_group_array(
      json_object(
        'edicion', sub.numero_edicion,
        'evento', sub.evento_nombre,
        'año', sub.año
      )
    )
    FROM (
      SELECT DISTINCT
        ee.numero_edicion,
        ev.nombre as evento_nombre,
        SUBSTR(MIN(eed.fecha), 1, 4) as año
      FROM evento_edicion_participante eep
      JOIN evento_edicion ee ON eep.evento_edicion_id = ee.id
      JOIN evento ev ON ee.evento_id = ev.id
      LEFT JOIN evento_edicion_dia eed ON ee.id = eed.evento_edicion_id
      WHERE eep.artista_id = a.id
      GROUP BY ee.id, ee.numero_edicion, ev.nombre
    ) sub
  ), '[]')
) as resultado
FROM catalogo_artista ca
JOIN artista a ON ca.artista_id = a.id
WHERE ca.activo = 1
ORDER BY ca.orden ASC
`

export async function catalogRepository(): Promise<CatalogArtist[]> {
  const source = getDataSource({ prod: 'database' })

  if (source === 'mock') {
    return getDataFromCatalogMock()
  }

  const { data, error } = await executeQuery<RawCatalogResult>(
    CATALOG_QUERY,
    [],
  )

  if (error) {
    throw new Error(`Error fetching catalog data: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return []
  }

  const parsedData = data.map((row) => JSON.parse(row.resultado))

  return mapCatalogArtists(parsedData)
}
