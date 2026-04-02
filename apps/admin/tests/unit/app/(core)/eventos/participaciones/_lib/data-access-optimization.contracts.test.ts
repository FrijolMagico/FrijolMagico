import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { readFileSync } from 'node:fs'

type SelectCall = {
  whereArgs: unknown[]
  orderByArgs: unknown[]
}

const PAGINATION_DAL_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/eventos/participaciones/_lib/data-access-layer/get-participations-paginated.ts'
const PAGE_PATH =
  '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/eventos/participaciones/page.tsx'

const cacheTag = mock(() => {})
let currentDb: ReturnType<typeof createDbMock>['db']

const dbProxy = {
  select: (...args: unknown[]) => {
    void args

    if (!currentDb) {
      throw new Error('currentDb mock was not initialized')
    }

    return currentDb.select()
  }
}

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ cacheTag }))
mock.module('@frijolmagico/database/orm', () => ({ db: dbProxy }))

function createQueryBuilder<T>(result: T, call: SelectCall) {
  const builder = {
    from: () => builder,
    leftJoin: () => builder,
    where: (...args: unknown[]) => {
      call.whereArgs.push(...args)
      return builder
    },
    orderBy: (...args: unknown[]) => {
      call.orderByArgs.push(...args)
      return builder
    },
    then: (
      resolve: (value: T) => unknown,
      reject?: (reason: unknown) => unknown
    ) => Promise.resolve(result).then(resolve, reject)
  }

  return builder
}

function createDbMock(results: unknown[]) {
  const calls: SelectCall[] = []

  return {
    calls,
    db: {
      select: () => {
        const result = results.shift()

        if (result === undefined) {
          throw new Error('No mocked result available for db.select')
        }

        const call: SelectCall = {
          whereArgs: [],
          orderByArgs: []
        }

        calls.push(call)

        return createQueryBuilder(result, call)
      }
    }
  }
}

const { getActivitiesWithDetails } =
  await import('@/core/eventos/participaciones/_lib/data-access-layer/get-activities-with-details')

describe('participations data access optimization contracts', () => {
  beforeEach(() => {
    cacheTag.mockClear()
  })

  test('pagination DAL uses joins for participant labels and drops correlated subqueries', () => {
    const source = readFileSync(PAGINATION_DAL_PATH, 'utf8')

    expect(source).toContain(
      'export async function getParticipationsPaginated('
    )
    expect(source).toContain(
      'eq(artistTable.id, editionParticipation.artistaId)'
    )
    expect(source).toContain(
      'eq(collective.id, editionParticipation.agrupacionId)'
    )
    expect(source).toContain(
      '.leftJoin(band, eq(band.id, editionParticipation.bandaId))'
    )
    expect(source).toContain(
      'conditions.push(sql`${sortLabel} like ${searchTerm}`)'
    )
    expect(source).toContain(
      'cacheTag(getEditionParticipationsCacheTag(edicionId))'
    )
    expect(source).not.toContain('select ${artistTable.pseudonimo}')
    expect(source).not.toContain('select ${collective.nombre}')
    expect(source).not.toContain('select ${band.name}')
  })

  test('child readers register scoped cache tags alongside the broad tags', () => {
    const exhibitionsSource = readFileSync(
      '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/eventos/participaciones/_lib/data-access-layer/get-exhibitions.ts',
      'utf8'
    )
    const activitiesSource = readFileSync(
      '/home/strocs/dev/FrijolMagico/apps/admin/src/app/(core)/eventos/participaciones/_lib/data-access-layer/get-activities-with-details.ts',
      'utf8'
    )

    expect(exhibitionsSource).toContain('cacheTag(EXHIBITION_CACHE_TAG)')
    expect(exhibitionsSource).toContain(
      'cacheTag(getParticipationExhibitionsCacheTag(participationId))'
    )

    expect(activitiesSource).toContain('cacheTag(ACTIVITY_CACHE_TAG)')
    expect(activitiesSource).toContain('cacheTag(ACTIVITY_DETAIL_CACHE_TAG)')
    expect(activitiesSource).toContain(
      'cacheTag(getParticipationActivitiesCacheTag(participationId))'
    )
  })

  test('page loads exhibitions and activities-with-details in a single parallel stage', () => {
    const source = readFileSync(PAGE_PATH, 'utf8')

    expect(source).toContain(
      "import { getActivitiesWithDetails } from './_lib/data-access-layer/get-activities-with-details'"
    )
    expect(source).toContain(
      "import { getParticipationsPaginated } from './_lib/data-access-layer/get-participations-paginated'"
    )
    expect(source).toContain('participationIds.length > 0')
    expect(source).toContain('getExhibitions(participationIds)')
    expect(source).toContain('getActivitiesWithDetails(participationIds)')
    expect(source).not.toContain('getActividadDetalles(')
    expect(source).not.toContain('getActividades(')
  })

  test('getActivitiesWithDetails returns null details when the left join misses', async () => {
    const dbMock = createDbMock([
      [
        {
          id: 9,
          participacionId: 3,
          tipoActividadId: 2,
          postulacionId: null,
          modoIngresoId: 4,
          puntaje: null,
          estado: 'confirmado',
          notas: 'Escenario principal',
          detalleId: null,
          detalleParticipacionActividadId: null,
          detalleTitulo: null,
          detalleDescripcion: null,
          detalleDuracionMinutos: null,
          detalleUbicacion: null,
          detalleHoraInicio: null,
          detalleCupos: null
        }
      ]
    ])
    currentDb = dbMock.db

    const result = await getActivitiesWithDetails([3])

    expect(cacheTag.mock.calls.map((call) => String(call.at(0)))).toEqual([
      'admin:actividad',
      'admin:actividad-detalle',
      'admin:actividad:participation:3'
    ])
    expect(result).toEqual([
      {
        id: 9,
        participacionId: 3,
        tipoActividadId: 2,
        postulacionId: null,
        modoIngresoId: 4,
        puntaje: null,
        estado: 'confirmado',
        notas: 'Escenario principal',
        detalle: null
      }
    ])
    expect(dbMock.calls).toHaveLength(1)
    expect(dbMock.calls[0]?.orderByArgs).toHaveLength(2)
  })

  test('getActivitiesWithDetails short-circuits empty participation lists', async () => {
    const dbMock = createDbMock([])
    currentDb = dbMock.db

    const result = await getActivitiesWithDetails([])

    expect(result).toEqual([])
    expect(dbMock.calls).toHaveLength(0)
  })
})
