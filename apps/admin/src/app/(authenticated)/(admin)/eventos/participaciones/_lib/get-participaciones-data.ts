import { cacheTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import {
  participations,
  artist,
  events,
  core
} from '@frijolmagico/database/schema'
import { isNotDeleted } from '@frijolmagico/database/filters'
import { eq, asc, desc, inArray } from 'drizzle-orm'

import { PARTICIPACIONES_CACHE_TAG } from '../_constants'

import type {
  ExpositorEntry,
  ActividadEntry,
  ActividadDetallesEntry,
  EdicionOption
} from '../_types'

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

export interface EdicionLookupResult {
  id: number
  slug: string | null
}

export async function getEdicionIdFromSlugOrLatest(
  slug?: string
): Promise<EdicionLookupResult | null> {
  'use cache'
  cacheTag(PARTICIPACIONES_CACHE_TAG)

  if (slug) {
    const found = await db.query.eventEdition.findFirst({
      where: (t, { eq }) => eq(t.slug, slug),
      columns: { id: true, slug: true }
    })
    return found ? { id: found.id, slug: found.slug } : null
  }

  const latest = await db.query.eventEdition.findFirst({
    orderBy: (t) => [desc(t.id)],
    columns: { id: true, slug: true }
  })
  return latest ? { id: latest.id, slug: latest.slug } : null
}

export interface ParticipacionesData {
  ediciones: EdicionOption[]
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
  edicionId: number
): Promise<ParticipacionesData> {
  'use cache'
  cacheTag(PARTICIPACIONES_CACHE_TAG)

  // 1. All editions (for edition switcher)
  const edicionesRaw = await db.query.eventEdition.findMany({
    with: { evento: true },
    orderBy: [asc(eventEdition.id)]
  })

  const ediciones: EdicionOption[] = edicionesRaw.map((row) => ({
    id: String(row.id),
    nombre: row.nombre,
    slug: row.slug,
    eventoNombre: row.evento?.nombre ?? 'Sin evento'
  }))

  // 2. Exposiciones for this edition
  const exposicionesRaw = await db
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
    .leftJoin(collective, eq(editionParticipation.agrupacionId, collective.id))
    .leftJoin(
      discipline,
      eq(participationExhibition.disciplinaId, discipline.id)
    )
    .leftJoin(
      admissionMode,
      eq(participationExhibition.modoIngresoId, admissionMode.id)
    )
    .where(eq(editionParticipation.edicionId, edicionId))
    .orderBy(asc(participationExhibition.id))

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

  // 3. Actividades for this edition
  const actividadesRaw = await db
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
    .leftJoin(collective, eq(editionParticipation.agrupacionId, collective.id))
    .leftJoin(
      activityType,
      eq(participationActivity.tipoActividadId, activityType.id)
    )
    .leftJoin(
      admissionMode,
      eq(participationActivity.modoIngresoId, admissionMode.id)
    )
    .where(eq(editionParticipation.edicionId, edicionId))
    .orderBy(asc(participationActivity.id))

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

  // 4. Activity details for this edition's activities
  const actividadIds = actividadesRaw.map((r) => r.activ.id)

  let actividadDetalles: ActividadDetallesEntry[] = []
  if (actividadIds.length > 0) {
    const detallesRaw = await db
      .select()
      .from(activity)
      .where(inArray(activity.participacionActividadId, actividadIds))
      .orderBy(asc(activity.id))

    actividadDetalles = detallesRaw.map((row) => ({
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
    }))
  }

  // 5. Lookup tables — disciplinas
  const disciplinasRaw = await db
    .select({ id: discipline.id, slug: discipline.slug })
    .from(discipline)
    .orderBy(asc(discipline.slug))

  const disciplinas = disciplinasRaw.map((row) => ({
    id: String(row.id),
    slug: row.slug
  }))

  // 6. Lookup tables — tipos de actividad
  const tiposActividadRaw = await db
    .select({ id: activityType.id, slug: activityType.slug })
    .from(activityType)
    .orderBy(asc(activityType.slug))

  const tiposActividad = tiposActividadRaw.map((row) => ({
    id: String(row.id),
    slug: row.slug
  }))

  // 7. Lookup tables — modos de ingreso
  const modosIngresoRaw = await db
    .select({ id: admissionMode.id, slug: admissionMode.slug })
    .from(admissionMode)
    .orderBy(asc(admissionMode.slug))

  const modosIngreso = modosIngresoRaw.map((row) => ({
    id: String(row.id),
    slug: row.slug
  }))

  // 8. Lookup tables — artistas
  const artistasRaw = await db
    .select({
      id: artistTable.id,
      pseudonimo: artistTable.pseudonimo,
      nombre: artistTable.nombre,
      estadoSlug: artistStatus.slug
    })
    .from(artistTable)
    .leftJoin(artistStatus, eq(artistTable.estadoId, artistStatus.id))
    .where(isNotDeleted(artistTable.deletedAt))
    .orderBy(asc(artistTable.pseudonimo))

  const artistas = artistasRaw.map((row) => ({
    id: String(row.id),
    pseudonimo: row.pseudonimo,
    nombre: row.nombre,
    estadoSlug: row.estadoSlug ?? 'desconocido',
    fotoUrl: null
  }))

  // 9. Lookup tables — agrupaciones
  const agrupacionesRaw = await db
    .select({
      id: collective.id,
      nombre: collective.nombre,
      descripcion: collective.descripcion,
      correo: collective.correo
    })
    .from(collective)
    .orderBy(asc(collective.nombre))

  const agrupaciones = agrupacionesRaw.map((row) => ({
    id: String(row.id),
    nombre: row.nombre,
    descripcion: row.descripcion,
    correo: row.correo
  }))

  return {
    ediciones,
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
