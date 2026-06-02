import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

const DAL_DIR =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/eventos/participaciones/_lib/data-access-layer'
const PAGE_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/eventos/participaciones/page.tsx'

const PAGINATION_PATH = DAL_DIR + '/get-participations.ts'
const EXHIBITIONS_PATH = DAL_DIR + '/get-exhibitions.ts'
const ACTIVITIES_PATH = DAL_DIR + '/get-activities-with-details.ts'

describe('participations data access optimization contracts', () => {
  test('pagination DAL includes artist and collective joins', () => {
    const source = readFileSync(PAGINATION_PATH, 'utf8')

    expect(source).toContain(
      'eq(artistTable.id, editionParticipation.artistaId)'
    )
    expect(source).toContain(
      'eq(collective.id, editionParticipation.agrupacionId)'
    )
  })

  test('child readers register scoped cache tags', () => {
    const exhibitionsSource = readFileSync(EXHIBITIONS_PATH, 'utf8')
    const activitiesSource = readFileSync(ACTIVITIES_PATH, 'utf8')

    expect(exhibitionsSource).toContain(
      'cacheTag(getParticipationExhibitionsCacheTag(participationId))'
    )

    expect(activitiesSource).toContain(
      'cacheTag(getParticipationActivitiesCacheTag(participationId))'
    )
  })

  test('page loads exhibitions and activities-with-details in parallel', () => {
    const source = readFileSync(PAGE_PATH, 'utf8')

    expect(source).toContain('getExhibitions(participationIds)')
    expect(source).toContain('getActivitiesWithDetails(participationIds)')
    expect(source).not.toContain('getActividadDetalles(')
    expect(source).not.toContain('getActividades(')
  })
})
