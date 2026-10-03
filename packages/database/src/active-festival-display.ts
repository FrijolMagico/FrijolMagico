import { and, asc, eq, gte, isNotNull, ne, sql } from 'drizzle-orm'
import type { db } from './drizzle'
import { place } from './db/schema/core'
import { event, eventEdition, eventEditionDay } from './db/schema/events'

export interface ActiveFestivalDisplayDay {
  fecha: string
  lugar: string | null
}

export interface ActiveFestivalDisplay {
  id: number
  slug: string
  event_name: string
  edition_number: string
  start_date: string
  end_date: string
  days: ActiveFestivalDisplayDay[]
}

type ActiveFestivalQuery = Pick<typeof db, 'select'>

/**
 * Reads the active edition and its topbar display values without caching.
 * Pass a transaction when the read must share a snapshot with a write.
 */
export async function getActiveFestivalDisplay(
  query: ActiveFestivalQuery
): Promise<ActiveFestivalDisplay | null> {
  const [edition] = await query
    .select({
      id: eventEdition.id,
      slug: eventEdition.slug,
      event_name: event.nombre,
      edition_number: eventEdition.numeroEdicion,
      start_date: sql<string>`MIN(${eventEditionDay.fecha})`,
      end_date: sql<string>`MAX(${eventEditionDay.fecha})`
    })
    .from(eventEdition)
    .innerJoin(event, eq(event.id, eventEdition.eventoId))
    .innerJoin(
      eventEditionDay,
      eq(eventEditionDay.eventoEdicionId, eventEdition.id)
    )
    .where(
      and(
        eq(eventEdition.published, true),
        isNotNull(eventEdition.slug),
        ne(eventEdition.slug, '')
      )
    )
    .groupBy(eventEdition.id)
    .having(
      gte(
        sql<string>`MAX(${eventEditionDay.fecha})`,
        sql<string>`date('now')`
      )
    )
    .orderBy(asc(sql<string>`MIN(${eventEditionDay.fecha})`))
    .limit(1)

  if (!edition?.slug) return null

  const days = await query
    .select({
      fecha: eventEditionDay.fecha,
      lugar: place.nombre
    })
    .from(eventEditionDay)
    .leftJoin(place, eq(place.id, eventEditionDay.lugarId))
    .where(eq(eventEditionDay.eventoEdicionId, edition.id))
    .orderBy(asc(eventEditionDay.fecha))

  return { ...edition, slug: edition.slug, days }
}

function normalizedDays(days: ActiveFestivalDisplayDay[]): string {
  return JSON.stringify(
    [...days].sort((left, right) => {
      return left.fecha.localeCompare(right.fecha)
    })
  )
}

/** Returns whether the displayed active-festival projection changed. */
export function compareActiveFestivalDisplay(
  before: ActiveFestivalDisplay | null,
  after: ActiveFestivalDisplay | null
): boolean {
  if (before === null || after === null) return before !== after

  return (
    before.id !== after.id ||
    before.slug !== after.slug ||
    before.event_name !== after.event_name ||
    before.edition_number !== after.edition_number ||
    before.start_date !== after.start_date ||
    before.end_date !== after.end_date ||
    normalizedDays(before.days) !== normalizedDays(after.days)
  )
}
