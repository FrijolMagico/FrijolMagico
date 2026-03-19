import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { events, core } from '@frijolmagico/database/schema'
import { and, asc, count, eq, inArray, sql } from 'drizzle-orm'

import type { EdicionEntry, EdicionDiaEntry, LugarEntry } from '../_types'
import type { PaginatedEdicion } from '../_types/paginated-edicion'
import type { EventoEntry } from '../../_types'
import {
  createPaginatedResponse,
  type ListQueryParams,
  type PaginatedResponse
} from '@/shared/types/pagination'
import type { EdicionListQueryFilters } from '@/shared/types/admin-list-filters'
import { formatEdicionFechas } from './format-edicion-fechas'
import {
  DEFAULT_EDICION_LIST_PARAMS,
  normalizeEdicionListQuery
} from './edicion-list-query'
import { EVENT_EDITION_CACHE_TAG, PLACE_CACHE_TAG } from '../../_constants'

const { eventEdition, eventEditionDay } = events
const { place } = core

interface GetEdicionesDataResult {
  ediciones: PaginatedResponse<PaginatedEdicion>
  dias: EdicionDiaEntry[]
  eventos: EventoEntry[]
}

function mapEdicionRow(
  row: typeof eventEdition.$inferSelect & { eventoId: number }
): EdicionEntry {
  return {
    ...row,
    id: String(row.id),
    eventoId: String(row.eventoId)
  }
}

function mapDiaRow(row: typeof eventEditionDay.$inferSelect): EdicionDiaEntry {
  return {
    ...row,
    id: String(row.id),
    eventoEdicionId: String(row.eventoEdicionId),
    lugarId: row.lugarId ? String(row.lugarId) : null
  }
}

function mapEventoRow(row: {
  id: number
  nombre: string
  slug: string | null
}): EventoEntry {
  return {
    id: String(row.id),
    nombre: row.nombre,
    slug: row.slug,
    descripcion: null,
    organizacionId: null
  }
}

function getModalidadLabel(modalidades: string[]): string | null {
  if (modalidades.length === 0) return null
  if (modalidades.length === 1) {
    return modalidades[0]
  }
  return 'mixto'
}

function logRecoverableEdicionesError(branch: string, error: unknown) {
  console.error(`[getEdiciones] Recoverable ${branch} query failure`, error)
}

export async function getEdiciones(): Promise<{
  ediciones: EdicionEntry[]
  dias: EdicionDiaEntry[]
} | null> {
  'use cache'
  cacheTag(EVENT_EDITION_CACHE_TAG)

  const [edicionesResult, diasResult] = await Promise.allSettled([
    db.select().from(eventEdition).orderBy(asc(eventEdition.createdAt)),
    db.select().from(eventEditionDay).orderBy(asc(eventEditionDay.fecha))
  ])

  if (
    edicionesResult.status === 'rejected' &&
    diasResult.status === 'rejected'
  ) {
    logRecoverableEdicionesError('ediciones', edicionesResult.reason)
    logRecoverableEdicionesError('dias', diasResult.reason)
    return null
  }

  if (edicionesResult.status === 'rejected') {
    logRecoverableEdicionesError('ediciones', edicionesResult.reason)
  }

  if (diasResult.status === 'rejected') {
    logRecoverableEdicionesError('dias', diasResult.reason)
  }

  const edicionesResults =
    edicionesResult.status === 'fulfilled' ? edicionesResult.value : []
  const diasResults = diasResult.status === 'fulfilled' ? diasResult.value : []

  const ediciones: EdicionEntry[] = edicionesResults
    .filter(
      (row): row is typeof row & { eventoId: number } => row.eventoId !== null
    )
    .map((row) => ({
      ...row,
      id: String(row.id),
      eventoId: String(row.eventoId)
    }))

  const dias: EdicionDiaEntry[] = diasResults.map((row) => ({
    ...row,
    id: String(row.id),
    eventoEdicionId: String(row.eventoEdicionId),
    lugarId: row.lugarId ? String(row.lugarId) : null
  }))

  return { ediciones, dias }
}

export async function getEdicionesData(
  params: ListQueryParams<EdicionListQueryFilters> = DEFAULT_EDICION_LIST_PARAMS
): Promise<GetEdicionesDataResult> {
  'use cache'
  cacheTag(EVENT_EDITION_CACHE_TAG)

  const query = normalizeEdicionListQuery(params)
  const conditions = [sql`${eventEdition.eventoId} IS NOT NULL`]

  if (query.eventoId) {
    conditions.push(eq(eventEdition.eventoId, Number(query.eventoId)))
  }

  if (query.search) {
    const searchTerm = `%${query.search.toLowerCase()}%`
    conditions.push(sql`(
      lower(coalesce(${eventEdition.nombre}, '')) like ${searchTerm}
      or lower(${eventEdition.numeroEdicion}) like ${searchTerm}
    )`)
  }

  const whereClause = and(...conditions)
  const offset = (query.page - 1) * query.pageSize

  const [edicionesResults, totalResult, eventosResult] = await Promise.all([
    db
      .select()
      .from(eventEdition)
      .where(whereClause)
      .orderBy(asc(eventEdition.createdAt))
      .limit(query.pageSize)
      .offset(offset),
    db.select({ total: count() }).from(eventEdition).where(whereClause),
    db
      .select({
        id: events.event.id,
        nombre: events.event.nombre,
        slug: events.event.slug
      })
      .from(events.event)
      .orderBy(asc(events.event.nombre))
  ])

  const safeEdiciones = edicionesResults.filter(
    (row): row is typeof row & { eventoId: number } => row.eventoId !== null
  )
  const edicionIds = safeEdiciones.map((row) => row.id)

  const [diasResults, lugaresResult] = await Promise.all([
    edicionIds.length === 0
      ? Promise.resolve([])
      : db
          .select()
          .from(eventEditionDay)
          .where(inArray(eventEditionDay.eventoEdicionId, edicionIds))
          .orderBy(asc(eventEditionDay.fecha)),
    getLugares()
  ])

  const dias = diasResults.map(mapDiaRow)
  const lugaresById = new Map(
    (lugaresResult ?? []).map((lugar) => [lugar.id, lugar])
  )
  const eventos = eventosResult.map(mapEventoRow)
  const eventosById = new Map(eventos.map((evento) => [evento.id, evento]))
  const diasByEdicionId = new Map<string, EdicionDiaEntry[]>()

  for (const dia of dias) {
    const existingDias = diasByEdicionId.get(dia.eventoEdicionId) ?? []
    existingDias.push(dia)
    diasByEdicionId.set(dia.eventoEdicionId, existingDias)
  }

  const paginatedEdiciones = safeEdiciones.map((row) => {
    const edicion = mapEdicionRow(row)
    const edicionDias = [...(diasByEdicionId.get(edicion.id) ?? [])].sort(
      (left, right) => left.fecha.localeCompare(right.fecha)
    )
    const modalidades = Array.from(
      new Set(edicionDias.map((dia) => dia.modalidad).filter(Boolean))
    )
    const firstDia = edicionDias[0]

    return {
      ...edicion,
      eventoNombre: eventosById.get(edicion.eventoId)?.nombre ?? '',
      dateRange: formatEdicionFechas(edicionDias),
      firstDate: firstDia?.fecha ?? '',
      lugarNombre: firstDia?.lugarId
        ? (lugaresById.get(firstDia.lugarId)?.nombre ?? null)
        : null,
      modalidadLabel: getModalidadLabel(modalidades)
    }
  })

  return {
    ediciones: createPaginatedResponse(paginatedEdiciones, {
      total: totalResult[0]?.total ?? 0,
      page: query.page,
      pageSize: query.pageSize
    }),
    dias,
    eventos
  }
}

export async function getLugares(): Promise<LugarEntry[] | null> {
  'use cache'
  cacheTag(PLACE_CACHE_TAG)

  const results = await db.select().from(place).orderBy(asc(place.nombre))

  if (results === undefined || results.length === 0) return null

  return results.map((row) => ({
    ...row,
    id: String(row.id)
  }))
}
