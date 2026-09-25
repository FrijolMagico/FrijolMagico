import { describe, expect, mock, test } from 'bun:test'
import { participations } from '@frijolmagico/database/schema'

const cacheTag = mock((_tag: string) => {})
const joins: unknown[] = []
let rows: Record<string, unknown>[] = []
const query = {
  from: () => query,
  leftJoin: (table: unknown) => {
    joins.push(table)
    return query
  },
  where: () => query,
  orderBy: async () => rows
}

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ cacheTag }))
mock.module('@frijolmagico/database/orm', () => ({
  db: { select: () => query }
}))

const { getActivitiesWithDetails } =
  await import('@/core/eventos/participaciones/_lib/data-access-layer/get-activities-with-details')
const { composeParticipations } =
  await import('@/core/eventos/participaciones/_lib/participation-composer')
const { registrationWindowToUtc } =
  await import('@/core/eventos/participaciones/_lib/activity-registration-time')

type Row = Awaited<ReturnType<typeof getActivitiesWithDetails>>[number]

const baseRow = {
  id: 42,
  participacionId: 11,
  tipoActividadId: 1,
  postulacionId: null,
  modoIngresoId: 1,
  puntaje: null,
  estado: 'seleccionado',
  notas: null,
  detalleId: null,
  detalleParticipacionActividadId: null,
  detalleTitulo: null,
  detalleDescripcion: null,
  detalleDuracionMinutos: null,
  detalleUbicacion: null,
  detalleHoraInicio: null,
  detalleCupos: null,
  registrationId: null,
  registrationUrl: null,
  registrationStartAt: null,
  registrationEndAt: null
}

function composedRegistration(activity: Row) {
  const result = composeParticipations({
    participations: [
      {
        id: 11,
        edicionId: 7,
        artistaId: 4,
        agrupacionId: null,
        bandaId: null,
        notas: null
      }
    ],
    edition: {
      id: 7,
      editionNumber: '1',
      slug: 'edition',
      eventName: 'Festival',
      published: true
    },
    exhibitions: [],
    activities: [activity],
    artistsLookup: new Map([[4, { id: 4, pseudonym: 'Artista', statusId: 1 }]]),
    collectivesLookup: new Map(),
    bandsLookup: new Map()
  })
  expect(result).toHaveLength(1)
  expect(result[0].activities).toHaveLength(1)
  return result[0].activities[0].registration
}

describe('admin activity read model', () => {
  test('keeps an absent left-joined registration null without parsing orphaned columns', async () => {
    joins.length = 0
    cacheTag.mockClear()
    rows = [{ ...baseRow, registrationStartAt: 'invalid' }]
    const result = await getActivitiesWithDetails([11])
    expect(joins).toEqual([
      participations.activity,
      participations.activityRegistration
    ])
    expect(result).toHaveLength(1)
    expect(result[0].registration).toBeNull()
    expect(composedRegistration(result[0])).toBeNull()
    expect(cacheTag).toHaveBeenCalled()
  })

  test('an ordinary absent join leaves the activity usable', async () => {
    rows = [{ ...baseRow }]
    const result = await getActivitiesWithDetails([11])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(42)
    expect(composedRegistration(result[0])).toBeNull()
  })

  test('converts both canonical UTC boundaries to Chile-local defaults through the composer', async () => {
    rows = [
      {
        ...baseRow,
        registrationId: 5,
        registrationUrl: 'https://registro.example/form',
        registrationStartAt: '2026-06-10T14:00:00.000Z',
        registrationEndAt: '2026-12-10T13:00:00.000Z'
      }
    ]
    const result = await getActivitiesWithDetails([11])
    expect(result).toHaveLength(1)
    const registration = composedRegistration(result[0])
    expect(registration).toEqual({
      url: 'https://registro.example/form',
      startDate: '2026-06-10',
      startTime: '10:00',
      endDate: '2026-12-10',
      endTime: '10:00'
    })
    if (registration === null) throw new Error('Expected registration defaults')
    expect(
      registrationWindowToUtc(
        registration.startDate,
        registration.startTime,
        registration.endDate,
        registration.endTime
      )
    ).toEqual({
      startAt: '2026-06-10T14:00:00.000Z',
      endAt: '2026-12-10T13:00:00.000Z'
    })
  })
})
