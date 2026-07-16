import { cacheTag } from 'next/cache'
import { EDITION_CACHE_TAG, EVENT_CACHE_TAG } from '@frijolmagico/cache-tags'
import { executeQuery } from '@frijolmagico/database/client'

export interface ActiveFestivalData {
  id: number
  slug: string
  event_name: string
  edition_number: string
  start_date: string
  end_date: string
}

export async function getActiveFestival() {
  'use cache'
  cacheTag(EDITION_CACHE_TAG)
  cacheTag(EVENT_CACHE_TAG)

  return await executeQuery<ActiveFestivalData>(
    `SELECT
  ee.id,
  ee.slug,
  e.nombre AS event_name,
  ee.numero_edicion AS edition_number,
  MIN(eed.fecha) AS start_date,
  MAX(eed.fecha) AS end_date
FROM evento_edicion ee
JOIN evento e ON e.id = ee.evento_id
JOIN evento_edicion_dia eed ON eed.evento_edicion_id = ee.id
WHERE ee.published = 1
  AND ee.slug IS NOT NULL
  AND ee.slug != ''
GROUP BY ee.id
HAVING MAX(eed.fecha) >= date('now')
ORDER BY MIN(eed.fecha) ASC
LIMIT 1`
  )
}
