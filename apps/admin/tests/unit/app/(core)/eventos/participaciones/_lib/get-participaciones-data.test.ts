import { beforeEach, describe, expect, mock, test, vi } from 'bun:test'

type QueryPlan<T> =
  | { type: 'resolve'; value: T }
  | { type: 'reject'; error: unknown }

const cacheTag = vi.fn()

let currentDb = createDbMock({
  eventEditionFindMany: [],
  select: []
})

const getDisciplinas = vi.fn()
const getActivityTypes = vi.fn()
const getAdmissionModes = vi.fn()
const getArtistasLookup = vi.fn()
const getAgrupaciones = vi.fn()

const dbProxy = {
  query: {
    eventEdition: {
      findMany: (...args: unknown[]) => currentDb.query.eventEdition.findMany(...args)
    }
  },
  select: (...args: unknown[]) => currentDb.select(...args)
}

mock.module('next/cache', () => ({ cacheTag }))
mock.module('@frijolmagico/database/orm', () => ({ db: dbProxy }))
mock.module(
  '@/core/eventos/participaciones/_lib/get-disciplinas',
  () => ({ getDisciplinas })
)
mock.module(
  '@/core/eventos/participaciones/_lib/get-activity-types',
  () => ({ getActivityTypes })
)
mock.module(
  '@/core/eventos/participaciones/_lib/get-admission-modes',
  () => ({ getAdmissionModes })
)
mock.module(
  '@/core/eventos/participaciones/_lib/get-artistas-lookup',
  () => ({ getArtistasLookup })
)
mock.module(
  '@/core/eventos/participaciones/_lib/get-agrupaciones',
  () => ({ getAgrupaciones })
)

function resolved<T>(value: T): QueryPlan<T> {
  return { type: 'resolve', value }
}

function rejected(error: unknown): QueryPlan<never> {
  return { type: 'reject', error }
}

function createQueryBuilder<T>(plan: QueryPlan<T>) {
  const builder = {
    from: () => builder,
    leftJoin: () => builder,
    innerJoin: () => builder,
    where: () => builder,
    groupBy: () => builder,
    orderBy: () => builder,
    limit: () => builder,
    offset: () => builder,
    then: (
      resolve: (value: T) => unknown,
      reject?: (reason: unknown) => unknown
    ) => {
      const promise =
        plan.type === 'resolve'
          ? Promise.resolve(plan.value)
          : Promise.reject(plan.error)

      return promise.then(resolve, reject)
    }
  }

  return builder
}

function createDbMock(plans: {
  eventEditionFindMany: QueryPlan<unknown>[]
  select: QueryPlan<unknown>[]
}) {
  return {
    query: {
      eventEdition: {
        findMany: vi.fn(() => {
          const plan = plans.eventEditionFindMany.shift()

          if (!plan) {
            throw new Error('No mocked plan available for db.query.eventEdition.findMany')
          }

          return plan.type === 'resolve'
            ? Promise.resolve(plan.value)
            : Promise.reject(plan.error)
        })
      }
    },
    select: vi.fn(() => {
      const plan = plans.select.shift()

      if (!plan) {
        throw new Error('No mocked plan available for db.select')
      }

      return createQueryBuilder(plan)
    })
  }
}

function createParticipantRow() {
  return {
    participationId: 100,
    artistaId: 10,
    agrupacionId: null,
    artistaNombre: 'Ana Pérez',
    artistaPseudonimo: 'Ana',
    artistaEstadoSlug: 'activo',
    agrupacionNombre: null,
    sortLabel: 'ana'
  }
}

function createExpositorRow() {
  return {
    expo: {
      id: 201,
      disciplinaId: 301,
      modoIngresoId: 401,
      puntaje: null,
      estado: 'confirmado',
      notas: null,
      postulacionId: null,
      createdAt: '2026-03-01',
      updatedAt: '2026-03-02'
    },
    part: {
      id: 100,
      artistaId: 10,
      agrupacionId: null,
      edicionId: 1
    },
    artistaNombre: 'Ana Pérez',
    artistaPseudonimo: 'Ana',
    artistaEstadoSlug: 'activo',
    agrupacionNombre: null,
    disciplinaSlug: 'pintura',
    modoIngresoSlug: 'postulacion'
  }
}

function createActividadRow() {
  return {
    activ: {
      id: 501,
      tipoActividadId: 601,
      modoIngresoId: 401,
      puntaje: null,
      estado: 'seleccionado',
      notas: null,
      postulacionId: null,
      createdAt: '2026-03-03',
      updatedAt: '2026-03-04'
    },
    part: {
      id: 100,
      artistaId: 10,
      agrupacionId: null,
      edicionId: 1
    },
    artistaNombre: 'Ana Pérez',
    artistaPseudonimo: 'Ana',
    artistaEstadoSlug: 'activo',
    agrupacionNombre: null,
    tipoActividadSlug: 'taller',
    modoIngresoSlug: 'postulacion'
  }
}

function createActividadDetalleRow() {
  return {
    id: 701,
    participacionActividadId: 501,
    titulo: 'Taller de acuarela',
    descripcion: 'Nivel inicial',
    duracionMinutos: 90,
    ubicacion: 'Sala azul',
    horaInicio: '10:00',
    cupos: 20,
    createdAt: '2026-03-05',
    updatedAt: '2026-03-06'
  }
}

function primeLookupMocks() {
  getDisciplinas.mockResolvedValue([{ id: '301', nombre: 'pintura' }])
  getActivityTypes.mockResolvedValue([{ id: '601', nombre: 'taller' }])
  getAdmissionModes.mockResolvedValue([{ id: '401', nombre: 'postulacion' }])
  getArtistasLookup.mockResolvedValue([
    {
      id: '10',
      pseudonimo: 'Ana',
      nombre: 'Ana Pérez',
      estadoSlug: 'activo',
      fotoUrl: null
    }
  ])
  getAgrupaciones.mockResolvedValue([{ id: '20', nombre: 'Colectivo Sur' }])
}

const { getParticipacionesData } = await import(
  '@/core/eventos/participaciones/_lib/get-participaciones-data'
)

describe('getParticipacionesData partial failure behavior', () => {
  beforeEach(() => {
    cacheTag.mockReset()
    vi.restoreAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})

    getDisciplinas.mockReset()
    getActivityTypes.mockReset()
    getAdmissionModes.mockReset()
    getArtistasLookup.mockReset()
    getAgrupaciones.mockReset()
  })

  test('returns partial data when wave 1 ediciones query fails', async () => {
    primeLookupMocks()
    currentDb = createDbMock({
      eventEditionFindMany: [rejected(new Error('ediciones failed'))],
      select: [
        resolved([createParticipantRow()]),
        resolved([{ total: 1 }]),
        resolved([createExpositorRow()]),
        resolved([createActividadRow()]),
        resolved([createActividadDetalleRow()])
      ]
    })

    const result = await getParticipacionesData(1)

    expect(result.ediciones).toEqual([])
    expect(result.participants.data).toHaveLength(1)
    expect(result.participants.total).toBe(1)
    expect(result.expositores).toHaveLength(1)
    expect(result.actividades).toHaveLength(1)
    expect(result.actividadDetalles).toHaveLength(1)
    expect(result.disciplinas).toEqual([{ id: '301', slug: 'pintura' }])
  })

  test('returns partial data when wave 1 participants query fails', async () => {
    primeLookupMocks()
    currentDb = createDbMock({
      eventEditionFindMany: [
        resolved([
          {
            id: 1,
            nombre: 'Edición 2026',
            slug: 'edicion-2026',
            evento: { nombre: 'Festival' }
          }
        ])
      ],
      select: [
        rejected(new Error('participants failed')),
        resolved([{ total: 0 }]),
        resolved([]),
        resolved([]),
        resolved([])
      ]
    })

    const result = await getParticipacionesData(1)

    expect(result.ediciones).toEqual([
      {
        id: '1',
        nombre: 'Edición 2026',
        slug: 'edicion-2026',
        eventoNombre: 'Festival'
      }
    ])
    expect(result.participants.data).toEqual([])
    expect(result.participants.total).toBe(0)
    expect(result.expositores).toEqual([])
    expect(result.actividades).toEqual([])
    expect(result.actividadDetalles).toEqual([])
  })

  test('returns partial data when wave 3 lookup queries fail', async () => {
    getDisciplinas.mockRejectedValue(new Error('disciplinas failed'))
    getActivityTypes.mockRejectedValue(new Error('tipos failed'))
    getAdmissionModes.mockRejectedValue(new Error('modos failed'))
    getArtistasLookup.mockRejectedValue(new Error('artistas failed'))
    getAgrupaciones.mockRejectedValue(new Error('agrupaciones failed'))

    currentDb = createDbMock({
      eventEditionFindMany: [
        resolved([
          {
            id: 1,
            nombre: 'Edición 2026',
            slug: 'edicion-2026',
            evento: { nombre: 'Festival' }
          }
        ])
      ],
      select: [
        resolved([createParticipantRow()]),
        resolved([{ total: 1 }]),
        resolved([createExpositorRow()]),
        resolved([createActividadRow()]),
        resolved([createActividadDetalleRow()])
      ]
    })

    const result = await getParticipacionesData(1)

    expect(result.ediciones).toHaveLength(1)
    expect(result.participants.data).toHaveLength(1)
    expect(result.expositores).toHaveLength(1)
    expect(result.actividades).toHaveLength(1)
    expect(result.actividadDetalles).toHaveLength(1)
    expect(result.disciplinas).toEqual([])
    expect(result.tiposActividad).toEqual([])
    expect(result.modosIngreso).toEqual([])
    expect(result.artistas).toEqual([])
    expect(result.agrupaciones).toEqual([])
  })
})
