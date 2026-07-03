import { executeQuery } from '@frijolmagico/database/client'
import { getDataSource } from '@/infra/config/dataSourceConfig'
import { getFestivalesMock } from '../../adapters/mocks/festivalesData.mock'

const FESTIVAL_SLUGS_QUERY = `SELECT ee.slug
FROM evento_edicion ee
JOIN evento e ON e.id = ee.evento_id
ORDER BY ee.id DESC`

function getMockSlugs(): string[] {
  return getFestivalesMock()
    .map((f) => f.evento.edicion_slug)
    .filter(Boolean)
}

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

    console.warn(
      '⚠️ Database query failed for festival slugs, falling back to mock data'
    )
  }

  return getMockSlugs()
}
