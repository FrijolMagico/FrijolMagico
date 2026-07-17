import { executeQuery } from '@frijolmagico/database/client'
import { getDataSource } from '@/infra/config/dataSourceConfig'

const FESTIVAL_SLUGS_QUERY = `SELECT ee.slug
FROM evento_edicion ee
JOIN evento e ON e.id = ee.evento_id
WHERE ee.published = 1
ORDER BY ee.id DESC`

/**
 * Slugs mock que corresponden a las claves existentes en
 * `festivalDetailData.mock.ts`, usados como fallback cuando
 * source='local' y la DB no esta disponible (dev/CI sin local.db).
 *
 * Para source='database' (produccion) fail closed: si la DB remota
 * no responde, retorna [] para que el build falle y no se silencie
 * un error real con datos mock.
 */
const MOCK_FESTIVAL_SLUGS = ['edicion-xv-1', 'edicion-3-2']

export async function getFestivalSlugs(): Promise<string[]> {
  const source = getDataSource({ prod: 'database' })

  if (source === 'local' || source === 'database') {
    const { data, error } = await executeQuery<{ slug: string | null }>(
      FESTIVAL_SLUGS_QUERY,
      []
    )

    if (!error && data && data.length > 0) {
      return data
        .map((row) => row.slug)
        .filter((slug): slug is string => Boolean(slug && slug.trim()))
    }

    if (error) {
      console.warn(
        '⚠️ Database query failed for festival slugs:',
        error.message
      )
    } else {
      console.warn('⚠️ No festival slugs found in database')
    }

    // En desarrollo (source='local'): si la DB no esta disponible,
    // cae a mock para que el build funcione sin local.db.
    if (source === 'local') {
      return MOCK_FESTIVAL_SLUGS
    }

    // En produccion (source='database'): fail closed.
    return []
  }

  return []
}
