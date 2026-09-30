import { executeQuery } from '@frijolmagico/database/client'
import { getDataSource } from '@/infra/config/dataSourceConfig'

const FESTIVAL_SLUGS_QUERY = `SELECT ee.slug
FROM evento_edicion ee
JOIN evento e ON e.id = ee.evento_id
WHERE ee.published = 1
ORDER BY ee.id DESC`

export async function getFestivalSlugs(): Promise<string[]> {
  const source = getDataSource({ prod: 'database' })

  if (source === 'local' || source === 'database') {
    const { data, error } = await executeQuery<{ slug: string | null }>(
      FESTIVAL_SLUGS_QUERY,
      []
    )

    if (error) {
      throw error
    }

    return (data ?? [])
      .map((row) => row.slug)
      .filter((slug): slug is string => Boolean(slug && slug.trim()))
  }

  throw new Error(`Unsupported data source: ${source}`)
}
