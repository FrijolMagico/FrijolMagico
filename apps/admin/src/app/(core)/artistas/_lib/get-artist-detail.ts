import 'server-only'

import { cacheTag } from 'next/cache'
import { and, eq, inArray, isNull } from 'drizzle-orm'

import {
  ACTIVITY_CACHE_TAG,
  ACTIVITY_DETAIL_CACHE_TAG,
  ACTIVITY_TYPES_CACHE_TAG,
  ARTIST_DETAIL_CACHE_TAG,
  DISCIPLINES_CACHE_TAG,
  EDITION_CACHE_TAG,
  EDITION_DAY_CACHE_TAG,
  EVENT_CACHE_TAG,
  EXHIBITION_CACHE_TAG,
  PARTICIPATIONS_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { db } from '@frijolmagico/database/orm'
import {
  artist,
  core,
  events,
  participations
} from '@frijolmagico/database/schema'
import { getAvatarUrl } from '@frijolmagico/utils/cdn'

import type {
  ArtistDetail,
  ArtistDetailActivity,
  ArtistDetailExhibition
} from '../_types/artist-detail'

// Days represent the actual edition dates; editions without days use their creation date.
// Assignment and edition IDs break ties independently of the database's row order.
function sortByEditionDate<
  T extends { id: number; editionId: number; editionDate: string }
>(rows: T[]): T[] {
  return rows.sort(
    (a, b) =>
      b.editionDate.localeCompare(a.editionDate) ||
      b.editionId - a.editionId ||
      b.id - a.id
  )
}

function uniqueById<T extends { id: number }>(rows: T[]): T[] {
  return [...new Map(rows.map((row) => [row.id, row])).values()]
}

export async function getArtistDetail(artistId: number): Promise<ArtistDetail> {
  'use cache'
  for (const tag of [
    ARTIST_DETAIL_CACHE_TAG,
    PARTICIPATIONS_CACHE_TAG,
    EXHIBITION_CACHE_TAG,
    ACTIVITY_CACHE_TAG,
    ACTIVITY_DETAIL_CACHE_TAG,
    EDITION_CACHE_TAG,
    EDITION_DAY_CACHE_TAG,
    EVENT_CACHE_TAG,
    DISCIPLINES_CACHE_TAG,
    ACTIVITY_TYPES_CACHE_TAG
  ]) {
    cacheTag(tag)
  }

  const [imageRows, activityRows, exhibitionRows] = await Promise.all([
    db
      .select({
        id: artist.artistImage.id,
        type: artist.artistImage.tipo,
        url: artist.artistImage.imagenUrl,
        order: artist.artistImage.orden
      })
      .from(artist.artistImage)
      .where(
        and(
          eq(artist.artistImage.artistaId, artistId),
          isNull(artist.artistImage.deletedAt)
        )
      )
      .orderBy(artist.artistImage.orden, artist.artistImage.id),
    db
      .select({
        id: participations.participationActivity.id,
        participationId: participations.editionParticipation.id,
        editionId: events.eventEdition.id,
        editionName: events.eventEdition.nombre,
        editionNumber: events.eventEdition.numeroEdicion,
        editionCreatedAt: events.eventEdition.createdAt,
        eventId: events.event.id,
        eventName: events.event.nombre,
        type: participations.activityType.slug,
        status: participations.participationActivity.estado,
        notes: participations.participationActivity.notas,
        participationNotes: participations.editionParticipation.notas,
        title: participations.activity.titulo
      })
      .from(participations.participationActivity)
      .innerJoin(
        participations.editionParticipation,
        eq(
          participations.participationActivity.participacionId,
          participations.editionParticipation.id
        )
      )
      .innerJoin(
        events.eventEdition,
        eq(
          participations.editionParticipation.edicionId,
          events.eventEdition.id
        )
      )
      .leftJoin(events.event, eq(events.eventEdition.eventoId, events.event.id))
      .innerJoin(
        participations.activityType,
        eq(
          participations.participationActivity.tipoActividadId,
          participations.activityType.id
        )
      )
      .leftJoin(
        participations.activity,
        eq(
          participations.activity.participacionActividadId,
          participations.participationActivity.id
        )
      )
      .where(eq(participations.editionParticipation.artistaId, artistId)),
    db
      .select({
        id: participations.participationExhibition.id,
        participationId: participations.editionParticipation.id,
        editionId: events.eventEdition.id,
        editionName: events.eventEdition.nombre,
        editionNumber: events.eventEdition.numeroEdicion,
        editionCreatedAt: events.eventEdition.createdAt,
        eventId: events.event.id,
        eventName: events.event.nombre,
        discipline: core.discipline.slug,
        status: participations.participationExhibition.estado,
        notes: participations.participationExhibition.notas,
        participationNotes: participations.editionParticipation.notas
      })
      .from(participations.participationExhibition)
      .innerJoin(
        participations.editionParticipation,
        eq(
          participations.participationExhibition.participacionId,
          participations.editionParticipation.id
        )
      )
      .innerJoin(
        events.eventEdition,
        eq(
          participations.editionParticipation.edicionId,
          events.eventEdition.id
        )
      )
      .leftJoin(events.event, eq(events.eventEdition.eventoId, events.event.id))
      .innerJoin(
        core.discipline,
        eq(
          participations.participationExhibition.disciplinaId,
          core.discipline.id
        )
      )
      .where(eq(participations.editionParticipation.artistaId, artistId))
  ])

  const uniqueActivities = uniqueById(activityRows)
  const uniqueExhibitions = uniqueById(exhibitionRows)
  const editionIds = [
    ...new Set([
      ...uniqueActivities.map((row) => row.editionId),
      ...uniqueExhibitions.map((row) => row.editionId)
    ])
  ]
  const days = editionIds.length
    ? await db
        .select({
          editionId: events.eventEditionDay.eventoEdicionId,
          date: events.eventEditionDay.fecha
        })
        .from(events.eventEditionDay)
        .where(inArray(events.eventEditionDay.eventoEdicionId, editionIds))
    : []

  const latestDayByEdition = new Map<number, string>()
  for (const { editionId, date } of days) {
    const latest = latestDayByEdition.get(editionId)
    if (!latest || date > latest) latestDayByEdition.set(editionId, date)
  }
  const withEditionDate = <
    T extends { editionId: number; editionCreatedAt: string }
  >(
    rows: T[]
  ) =>
    rows.map((row) => ({
      ...row,
      editionDate: latestDayByEdition.get(row.editionId) ?? row.editionCreatedAt
    }))

  const activities: ArtistDetailActivity[] = sortByEditionDate(
    withEditionDate(uniqueActivities)
  )
  const exhibitions: ArtistDetailExhibition[] = sortByEditionDate(
    withEditionDate(uniqueExhibitions)
  )

  return {
    images: imageRows.map((row) => ({ ...row, url: getAvatarUrl(row.url) })),
    activities,
    exhibitions,
    activityCount: activities.length,
    exhibitionCount: exhibitions.length
  }
}
