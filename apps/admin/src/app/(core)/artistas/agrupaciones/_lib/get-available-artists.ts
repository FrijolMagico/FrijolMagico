import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, asc, eq, isNull, notExists, sql } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ArtistLookup } from '../_types/agrupacion'

const { artist: artistTable, collectiveArtist } = artist

export async function getAvailableArtists(
  agrupacionId: number,
  search = ''
): Promise<ArtistLookup[]> {
  await requireAuth()

  const conditions = [
    isNull(artistTable.deletedAt),
    notExists(
      db
        .select({ artistaId: collectiveArtist.artistaId })
        .from(collectiveArtist)
        .where(
          and(
            eq(collectiveArtist.agrupacionId, agrupacionId),
            eq(collectiveArtist.artistaId, artistTable.id),
            eq(collectiveArtist.activo, true)
          )
        )
    )
  ]

  if (search.trim()) {
    const searchTerm = `%${search.trim().toLowerCase()}%`
    conditions.push(
      sql`(
        lower(coalesce(${artistTable.pseudonimo}, '')) like ${searchTerm}
        or lower(coalesce(${artistTable.nombre}, '')) like ${searchTerm}
      )`
    )
  }

  return db
    .select({
      id: artistTable.id,
      pseudonimo: artistTable.pseudonimo,
      ciudad: artistTable.ciudad
    })
    .from(artistTable)
    .where(and(...conditions))
    .orderBy(asc(artistTable.pseudonimo))
    .limit(20)
}
