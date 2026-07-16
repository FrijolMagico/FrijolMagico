import { cacheTag } from 'next/cache'
import { EDITION_CACHE_TAG } from '@frijolmagico/cache-tags'
import { executeQuery } from '@frijolmagico/database/client'

export interface EditionDayRow {
  fecha: string
  lugar: string | null
}

/**
 * Returns the days (with venue) for a given edition.
 * Used by the TopBar to build the date-and-place display string.
 */
export async function getEditionDays(editionId: number) {
  'use cache'
  cacheTag(EDITION_CACHE_TAG)

  return await executeQuery<EditionDayRow>(
    `SELECT eed.fecha, p.nombre AS lugar
FROM evento_edicion_dia eed
LEFT JOIN lugar p ON p.id = eed.lugar_id
WHERE eed.evento_edicion_id = ?
ORDER BY eed.fecha ASC`,
    [editionId]
  )
}
