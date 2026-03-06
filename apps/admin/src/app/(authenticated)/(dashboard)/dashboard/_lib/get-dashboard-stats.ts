'use server'

import { cacheTag } from 'next/cache'
import { count, desc, asc, eq, and, isNotNull, sql } from 'drizzle-orm'

import { db } from '@frijolmagico/database/orm'
import {
  artist,
  events,
  core,
  participations
} from '@frijolmagico/database/schema'
import { isNotDeleted } from '@frijolmagico/database/filters'

import { ARTISTA_CACHE_TAG } from '@/admin/artistas/_constants'
import { CATALOG_CACHE_TAG } from '@/admin/artistas/catalogo/_constants'
import {
  EVENTO_CACHE_TAG,
  EVENTO_EDICION_CACHE_TAG
} from '@/admin/eventos/_constants'

import type {
  DashboardArtistStats,
  DashboardEventStats,
  EditionGrowthPoint,
  DisciplinePoint,
  CityPoint,
  TopArtistEntry
} from '../_types'
import { FESTIVAL_EVENT_ID } from '../_constants'

const { artist: artistTable, artistStatus, catalogArtist } = artist
const { eventEdition } = events
const { discipline } = core
const { eventEditionParticipant, participantExhibition } = participations

export async function getDashboardArtistStats(): Promise<DashboardArtistStats | null> {
  'use cache'
  cacheTag(ARTISTA_CACHE_TAG, CATALOG_CACHE_TAG)

  const [statusRows, catalogRow, completenessRow] = await Promise.all([
    db
      .select({ slug: artistStatus.slug, count: count() })
      .from(artistTable)
      .leftJoin(artistStatus, eq(artistTable.estadoId, artistStatus.id))
      .where(isNotDeleted(artistTable.deletedAt))
      .groupBy(artistStatus.slug),
    db
      .select({ count: count() })
      .from(catalogArtist)
      .where(
        and(
          eq(catalogArtist.activo, true),
          isNotDeleted(catalogArtist.deletedAt)
        )
      ),
    db
      .select({
        total: count(),
        withEmail: sql<number>`COUNT(CASE WHEN ${artistTable.correo} IS NOT NULL THEN 1 END)`,
        withPhone: sql<number>`COUNT(CASE WHEN ${artistTable.telefono} IS NOT NULL THEN 1 END)`,
        withRut: sql<number>`COUNT(CASE WHEN ${artistTable.rut} IS NOT NULL THEN 1 END)`
      })
      .from(artistTable)
      .where(isNotDeleted(artistTable.deletedAt))
  ])

  if (!completenessRow[0]) return null

  return {
    total: statusRows.reduce((sum, r) => sum + r.count, 0),
    byStatus: statusRows.map((r) => ({
      slug: r.slug ?? 'desconocido',
      count: r.count
    })),
    catalogActive: catalogRow[0]?.count ?? 0,
    completeness: {
      total: completenessRow[0].total,
      withEmail: completenessRow[0].withEmail,
      withPhone: completenessRow[0].withPhone,
      withRut: completenessRow[0].withRut
    }
  }
}

export async function getDashboardEventStats(): Promise<DashboardEventStats | null> {
  'use cache'
  cacheTag(EVENTO_CACHE_TAG, EVENTO_EDICION_CACHE_TAG)

  const [participationRow, editionCountRow, latestRows] = await Promise.all([
    db.select({ count: count() }).from(eventEditionParticipant),
    db.select({ count: count() }).from(eventEdition),
    db
      .select({
        id: eventEdition.id,
        nombre: eventEdition.nombre,
        numeroEdicion: eventEdition.numeroEdicion,
        participantCount: count(eventEditionParticipant.id)
      })
      .from(eventEdition)
      .leftJoin(
        eventEditionParticipant,
        eq(eventEdition.id, eventEditionParticipant.eventoEdicionId)
      )
      .where(eq(eventEdition.eventoId, FESTIVAL_EVENT_ID))
      .groupBy(eventEdition.id)
      .orderBy(desc(eventEdition.id))
      .limit(1)
  ])

  const latest = latestRows[0] ?? null

  return {
    totalParticipations: participationRow[0]?.count ?? 0,
    totalEditions: editionCountRow[0]?.count ?? 0,
    latestEdition: latest
      ? {
          id: String(latest.id),
          nombre: latest.nombre || null,
          numeroEdicion: latest.numeroEdicion,
          participantCount: latest.participantCount
        }
      : null
  }
}

export async function getDashboardGrowthData(): Promise<EditionGrowthPoint[]> {
  'use cache'
  cacheTag(ARTISTA_CACHE_TAG, EVENTO_EDICION_CACHE_TAG)

  const rows = await db
    .select({
      edicionId: eventEdition.id,
      numero: eventEdition.numeroEdicion,
      nombre: eventEdition.nombre,
      participantes: count(eventEditionParticipant.id)
    })
    .from(eventEdition)
    .leftJoin(
      eventEditionParticipant,
      eq(eventEdition.id, eventEditionParticipant.eventoEdicionId)
    )
    .where(eq(eventEdition.eventoId, FESTIVAL_EVENT_ID))
    .groupBy(eventEdition.id)
    .orderBy(asc(eventEdition.id))

  return rows.map((r) => ({
    edicionId: String(r.edicionId),
    numero: r.numero,
    nombre: r.nombre || null,
    participantes: r.participantes
  }))
}

export async function getDashboardDisciplineData(): Promise<DisciplinePoint[]> {
  'use cache'
  cacheTag(ARTISTA_CACHE_TAG, EVENTO_EDICION_CACHE_TAG)

  const rows = await db
    .select({
      disciplina: discipline.slug,
      count: count()
    })
    .from(participantExhibition)
    .innerJoin(
      discipline,
      eq(participantExhibition.disciplinaId, discipline.id)
    )
    .groupBy(discipline.slug)
    .orderBy(desc(count()))

  return rows.map((r) => ({
    disciplina: r.disciplina,
    count: r.count
  }))
}

export async function getDashboardTopArtists(): Promise<TopArtistEntry[]> {
  'use cache'
  cacheTag(ARTISTA_CACHE_TAG, EVENTO_EDICION_CACHE_TAG)

  const rows = await db
    .select({
      id: artistTable.id,
      pseudonimo: artistTable.pseudonimo,
      ediciones: count(eventEditionParticipant.id)
    })
    .from(eventEditionParticipant)
    .innerJoin(
      artistTable,
      eq(eventEditionParticipant.artistaId, artistTable.id)
    )
    .groupBy(artistTable.id)
    .orderBy(desc(count(eventEditionParticipant.id)))
    .limit(5)

  return rows.map((r) => ({
    id: String(r.id),
    pseudonimo: r.pseudonimo,
    ediciones: r.ediciones
  }))
}

export async function getDashboardGeographicData(): Promise<CityPoint[]> {
  'use cache'
  cacheTag(ARTISTA_CACHE_TAG)

  const rows = await db
    .select({
      ciudad: artistTable.ciudad,
      count: count()
    })
    .from(artistTable)
    .where(
      and(isNotDeleted(artistTable.deletedAt), isNotNull(artistTable.ciudad))
    )
    .groupBy(artistTable.ciudad)
    .orderBy(desc(count()))
    .limit(6)

  return rows
    .filter((r): r is typeof r & { ciudad: string } => r.ciudad !== null)
    .map((r) => ({
      ciudad: r.ciudad,
      count: r.count
    }))
}
