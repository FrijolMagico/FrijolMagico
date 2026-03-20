import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import {
  artist,
  core,
  events,
  participations
} from '@frijolmagico/database/schema'
import { and, asc, count, desc, eq, inArray, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'

import { EVENT_EDITION_CACHE_TAG } from '../../_constants'
import { participacionesQueryParamsSchema } from '../_schemas/query-params.schema'
import { PARTICIPACIONES_CACHE_TAG } from '../_constants'
import type {
  ActividadDetallesEntry,
  ActividadEntry,
  EdicionOption,
  ExpositorEntry,
  ParticipantListRow,
  ParticipantProjectionRow
} from '../_types'
import { getActivityTypes } from './get-activity-types'
import { getAdmissionModes } from './get-admission-modes'
import { getAgrupaciones } from './get-agrupaciones'
import { getArtistasLookup } from './get-artistas-lookup'
import { getDisciplinas } from './get-disciplinas'
import {
  buildParticipantRowsFromProjection,
  getParticipantKey
} from './participants-view'
import {
  createPaginatedResponse,
  type PaginatedResponse
} from '@/shared/types/pagination'

const {
  participationExhibition,
  participationActivity,
  editionParticipation,
  activity,
  admissionMode,
  activityType
} = participations
const { artist: artistTable, artistStatus, collective } = artist
const { eventEdition } = events
const { discipline } = core

function logRecoverableParticipacionesError(branch: string, error: unknown) {
  console.error(
    `[getParticipacionesData] Recoverable ${branch} query failure`,
    error
  )
}

function getSettledValue<T>(
  result: PromiseSettledResult<T>,
  fallback: T,
  branch: string
): T {
  if (result.status === 'fulfilled') return result.value

  logRecoverableParticipacionesError(branch, result.reason)
  return fallback
}

export interface EdicionLookupResult {
  id: number
  slug: string | null
}

export async function getEdicionIdFromSlugOrLatest(
  slug?: string
): Promise<EdicionLookupResult | null> {
  'use cache'
  cacheTag(EVENT_EDITION_CACHE_TAG)

  if (slug) {
    const found = await db.query.eventEdition.findFirst({
      where: (table, { eq }) => eq(table.slug, slug),
      columns: { id: true, slug: true }
    })
    return found ? { id: found.id, slug: found.slug } : null
  }

  const latest = await db.query.eventEdition.findFirst({
    orderBy: (table) => [desc(table.id)],
    columns: { id: true, slug: true }
  })
  return latest ? { id: latest.id, slug: latest.slug } : null
}

export interface ParticipacionesData {
  ediciones: EdicionOption[]
  participants: PaginatedResponse<ParticipantListRow>
  expositores: ExpositorEntry[]
  actividades: ActividadEntry[]
  actividadDetalles: ActividadDetallesEntry[]
  disciplinas: { id: string; slug: string }[]
  tiposActividad: { id: string; slug: string }[]
  modosIngreso: { id: string; slug: string }[]
  artistas: {
    id: string
    pseudonimo: string
    nombre: string | null
    estadoSlug: string
    fotoUrl: string | null
  }[]
  agrupaciones: {
    id: string
    nombre: string
    descripcion: string | null
    correo: string | null
  }[]
}

export async function getParticipacionesData(
  edicionId: number,
  rawParams: unknown
): Promise<ParticipacionesData> {
  'use cache'
  cacheTag(PARTICIPACIONES_CACHE_TAG)

  const query = participacionesQueryParamsSchema.parse(rawParams)
  const offset = (query.page - 1) * query.limit
  const conditions: SQL[] = [eq(editionParticipation.edicionId, edicionId)]

  if (query.estado) {
    conditions.push(
      sql`(
        ${participationExhibition.estado} = ${query.estado}
        or ${participationActivity.estado} = ${query.estado}
      )`
    )
  }

  if (query.search) {
    const searchTerm = `%${query.search.toLowerCase()}%`

    conditions.push(sql`(
      lower(coalesce(${artistTable.pseudonimo}, '')) like ${searchTerm}
      or lower(coalesce(${artistTable.nombre}, '')) like ${searchTerm}
      or lower(coalesce(${collective.nombre}, '')) like ${searchTerm}
      or exists (
        select 1
        from ${participationExhibition} as pe_search
        left join ${discipline} as d_search
          on d_search.id = pe_search.disciplina_id
        where pe_search.participacion_id = ${editionParticipation.id}
          and lower(coalesce(d_search.slug, '')) like ${searchTerm}
      )
      or exists (
        select 1
        from ${participationActivity} as pa_search
        left join ${activityType} as at_search
          on at_search.id = pa_search.tipo_actividad_id
        where pa_search.participacion_id = ${editionParticipation.id}
          and lower(coalesce(at_search.slug, '')) like ${searchTerm}
      )
    )`)
  }

  const whereClause = and(...conditions)

  const [edicionesResult, participantsResult, totalResultSet] =
    await Promise.allSettled([
      db.query.eventEdition.findMany({
        with: { evento: true },
        orderBy: [asc(eventEdition.id)]
      }),
      db
        .select({
          participationId: editionParticipation.id,
          artistaId: editionParticipation.artistaId,
          agrupacionId: editionParticipation.agrupacionId,
          artistaNombre: artistTable.nombre,
          artistaPseudonimo: artistTable.pseudonimo,
          artistaEstadoSlug: artistStatus.slug,
          agrupacionNombre: collective.nombre,
          sortLabel: sql<string>`lower(coalesce(${artistTable.pseudonimo}, ${artistTable.nombre}, ${collective.nombre}, 'participante sin nombre'))`
        })
        .from(editionParticipation)
        .leftJoin(
          artistTable,
          eq(editionParticipation.artistaId, artistTable.id)
        )
        .leftJoin(artistStatus, eq(artistTable.estadoId, artistStatus.id))
        .leftJoin(
          collective,
          eq(editionParticipation.agrupacionId, collective.id)
        )
        .leftJoin(
          participationExhibition,
          eq(participationExhibition.participacionId, editionParticipation.id)
        )
        .leftJoin(
          participationActivity,
          eq(participationActivity.participacionId, editionParticipation.id)
        )
        .where(whereClause)
        .groupBy(
          editionParticipation.id,
          editionParticipation.artistaId,
          editionParticipation.agrupacionId,
          artistTable.nombre,
          artistTable.pseudonimo,
          artistStatus.slug,
          collective.nombre
        )
        .orderBy(
          sql`lower(coalesce(${artistTable.pseudonimo}, ${artistTable.nombre}, ${collective.nombre}, 'participante sin nombre'))`,
          asc(editionParticipation.id)
        )
        .limit(query.limit)
        .offset(offset),
      db
        .select({ total: count(sql`distinct ${editionParticipation.id}`) })
        .from(editionParticipation)
        .leftJoin(
          artistTable,
          eq(editionParticipation.artistaId, artistTable.id)
        )
        .leftJoin(artistStatus, eq(artistTable.estadoId, artistStatus.id))
        .leftJoin(
          collective,
          eq(editionParticipation.agrupacionId, collective.id)
        )
        .leftJoin(
          participationExhibition,
          eq(participationExhibition.participacionId, editionParticipation.id)
        )
        .leftJoin(
          participationActivity,
          eq(participationActivity.participacionId, editionParticipation.id)
        )
        .where(whereClause)
    ])

  const edicionesRaw = getSettledValue(edicionesResult, [], 'ediciones')
  const participantsRaw = getSettledValue(
    participantsResult,
    [],
    'participants'
  )
  const totalResult = getSettledValue(totalResultSet, [], 'participants-total')

  const ediciones: EdicionOption[] = edicionesRaw.map((row) => ({
    id: String(row.id),
    nombre: row.nombre,
    slug: row.slug,
    eventoNombre: row.evento?.nombre ?? 'Sin evento'
  }))

  const participantProjection: ParticipantProjectionRow[] = participantsRaw.map(
    (row) => ({
      participationId: String(row.participationId),
      key: getParticipantKey(
        row.artistaId ? String(row.artistaId) : null,
        row.agrupacionId ? String(row.agrupacionId) : null
      ),
      artistaId: row.artistaId ? String(row.artistaId) : null,
      agrupacionId: row.agrupacionId ? String(row.agrupacionId) : null,
      artistaNombre: row.artistaNombre,
      artistaPseudonimo: row.artistaPseudonimo,
      artistaFoto: null,
      artistaEstadoSlug: row.artistaEstadoSlug,
      agrupacionNombre: row.agrupacionNombre
    })
  )

  const participationIds = participantProjection.map((row) =>
    Number(row.participationId)
  )

  const [exposicionesResult, actividadesResult] = await Promise.allSettled([
    db
      .select({
        expo: participationExhibition,
        part: editionParticipation,
        artistaNombre: artistTable.nombre,
        artistaPseudonimo: artistTable.pseudonimo,
        artistaEstadoSlug: artistStatus.slug,
        agrupacionNombre: collective.nombre,
        disciplinaSlug: discipline.slug,
        modoIngresoSlug: admissionMode.slug
      })
      .from(participationExhibition)
      .innerJoin(
        editionParticipation,
        eq(participationExhibition.participacionId, editionParticipation.id)
      )
      .leftJoin(artistTable, eq(editionParticipation.artistaId, artistTable.id))
      .leftJoin(artistStatus, eq(artistTable.estadoId, artistStatus.id))
      .leftJoin(
        collective,
        eq(editionParticipation.agrupacionId, collective.id)
      )
      .leftJoin(
        discipline,
        eq(participationExhibition.disciplinaId, discipline.id)
      )
      .leftJoin(
        admissionMode,
        eq(participationExhibition.modoIngresoId, admissionMode.id)
      )
      .where(
        participationIds.length > 0
          ? inArray(editionParticipation.id, participationIds)
          : sql`1 = 0`
      )
      .orderBy(asc(participationExhibition.id)),
    db
      .select({
        activ: participationActivity,
        part: editionParticipation,
        artistaNombre: artistTable.nombre,
        artistaPseudonimo: artistTable.pseudonimo,
        artistaEstadoSlug: artistStatus.slug,
        agrupacionNombre: collective.nombre,
        tipoActividadSlug: activityType.slug,
        modoIngresoSlug: admissionMode.slug
      })
      .from(participationActivity)
      .innerJoin(
        editionParticipation,
        eq(participationActivity.participacionId, editionParticipation.id)
      )
      .leftJoin(artistTable, eq(editionParticipation.artistaId, artistTable.id))
      .leftJoin(artistStatus, eq(artistTable.estadoId, artistStatus.id))
      .leftJoin(
        collective,
        eq(editionParticipation.agrupacionId, collective.id)
      )
      .leftJoin(
        activityType,
        eq(participationActivity.tipoActividadId, activityType.id)
      )
      .leftJoin(
        admissionMode,
        eq(participationActivity.modoIngresoId, admissionMode.id)
      )
      .where(
        participationIds.length > 0
          ? inArray(editionParticipation.id, participationIds)
          : sql`1 = 0`
      )
      .orderBy(asc(participationActivity.id))
  ])

  const exposicionesRaw = getSettledValue(exposicionesResult, [], 'expositores')
  const actividadesRaw = getSettledValue(actividadesResult, [], 'actividades')

  const expositores: ExpositorEntry[] = exposicionesRaw.map((row) => ({
    id: String(row.expo.id),
    artistaId: row.part.artistaId ? String(row.part.artistaId) : null,
    agrupacionId: row.part.agrupacionId ? String(row.part.agrupacionId) : null,
    eventoEdicionId: String(row.part.edicionId),
    disciplinaId: String(row.expo.disciplinaId),
    modoIngresoId: String(row.expo.modoIngresoId),
    puntaje: row.expo.puntaje,
    estado: row.expo.estado,
    notas: row.expo.notas,
    postulacionId: row.expo.postulacionId
      ? String(row.expo.postulacionId)
      : null,
    participanteId: String(row.part.id),
    createdAt: row.expo.createdAt,
    updatedAt: row.expo.updatedAt,
    artistaNombre: row.artistaNombre,
    artistaPseudonimo: row.artistaPseudonimo,
    artistaFoto: null,
    artistaEstadoSlug: row.artistaEstadoSlug,
    agrupacionNombre: row.agrupacionNombre,
    disciplinaSlug: row.disciplinaSlug,
    modoIngresoSlug: row.modoIngresoSlug
  }))

  const actividades: ActividadEntry[] = actividadesRaw.map((row) => ({
    id: String(row.activ.id),
    artistaId: row.part.artistaId ? String(row.part.artistaId) : null,
    agrupacionId: row.part.agrupacionId ? String(row.part.agrupacionId) : null,
    eventoEdicionId: String(row.part.edicionId),
    tipoActividadId: String(row.activ.tipoActividadId),
    modoIngresoId: String(row.activ.modoIngresoId),
    puntaje: row.activ.puntaje,
    estado: row.activ.estado,
    notas: row.activ.notas,
    postulacionId: row.activ.postulacionId
      ? String(row.activ.postulacionId)
      : null,
    participanteId: String(row.part.id),
    createdAt: row.activ.createdAt,
    updatedAt: row.activ.updatedAt,
    artistaNombre: row.artistaNombre,
    artistaPseudonimo: row.artistaPseudonimo,
    artistaFoto: null,
    artistaEstadoSlug: row.artistaEstadoSlug,
    agrupacionNombre: row.agrupacionNombre,
    tipoActividadSlug: row.tipoActividadSlug,
    modoIngresoSlug: row.modoIngresoSlug
  }))

  const actividadIds = actividadesRaw.map((row) => row.activ.id)

  const [
    detallesResult,
    disciplinasResult,
    tiposActividadResult,
    modosIngresoResult,
    artistasResult,
    agrupacionesResult
  ] = await Promise.allSettled([
    db
      .select()
      .from(activity)
      .where(
        actividadIds.length > 0
          ? inArray(activity.participacionActividadId, actividadIds)
          : sql`1 = 0`
      )
      .orderBy(asc(activity.id)),
    getDisciplinas(),
    getActivityTypes(),
    getAdmissionModes(),
    getArtistasLookup(),
    getAgrupaciones()
  ])

  const detallesRaw = getSettledValue(detallesResult, [], 'actividad-detalles')
  const disciplinasLookup = getSettledValue(
    disciplinasResult,
    [],
    'disciplinas'
  )
  const tiposActividadLookup = getSettledValue(
    tiposActividadResult,
    [],
    'tipos-actividad'
  )
  const modosIngresoLookup = getSettledValue(
    modosIngresoResult,
    [],
    'modos-ingreso'
  )
  const artistas = getSettledValue(artistasResult, [], 'artistas')
  const agrupacionesLookup = getSettledValue(
    agrupacionesResult,
    [],
    'agrupaciones'
  )

  const actividadDetalles: ActividadDetallesEntry[] = detallesRaw.map(
    (row) => ({
      id: String(row.id),
      participanteActividadId: String(row.participacionActividadId),
      titulo: row.titulo,
      descripcion: row.descripcion,
      duracionMinutos: row.duracionMinutos,
      ubicacion: row.ubicacion,
      horaInicio: row.horaInicio,
      cupos: row.cupos,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    })
  )

  const disciplinas = disciplinasLookup.map((row) => ({
    id: row.id,
    slug: row.nombre
  }))

  const tiposActividad = tiposActividadLookup.map((row) => ({
    id: row.id,
    slug: row.nombre
  }))

  const modosIngreso = modosIngresoLookup.map((row) => ({
    id: row.id,
    slug: row.nombre
  }))

  const agrupaciones = agrupacionesLookup.map((row) => ({
    id: row.id,
    nombre: row.nombre,
    descripcion: null,
    correo: null
  }))

  const paginatedParticipants: ParticipantListRow[] =
    buildParticipantRowsFromProjection(
      participantProjection,
      expositores,
      actividades
    )

  return {
    ediciones,
    participants: createPaginatedResponse(paginatedParticipants, {
      total: totalResult[0]?.total ?? 0,
      page: query.page,
      pageSize: query.limit
    }),
    expositores,
    actividades,
    actividadDetalles,
    disciplinas,
    tiposActividad,
    modosIngreso,
    artistas,
    agrupaciones
  }
}
