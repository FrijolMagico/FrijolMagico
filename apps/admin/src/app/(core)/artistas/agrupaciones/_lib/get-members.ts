import 'server-only'

import { cacheTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, asc, eq, isNull } from 'drizzle-orm'
import { getAgrupacionMembersCacheTag } from '../_constants'
import type { CollectiveMember } from '../_types/agrupacion'

const {
  collectiveArtist,
  artist: artistTable
} = artist

export async function getMembers(
  agrupacionId: number
): Promise<CollectiveMember[]> {
  'use cache'
  cacheTag(getAgrupacionMembersCacheTag(agrupacionId))

  return db
    .select({
      agrupacionId: collectiveArtist.agrupacionId,
      artistaId: collectiveArtist.artistaId,
      rol: collectiveArtist.rol,
      activo: collectiveArtist.activo,
      createdAt: collectiveArtist.createdAt,
      artistPseudonimo: artistTable.pseudonimo,
      artistCiudad: artistTable.ciudad
    })
    .from(collectiveArtist)
    .innerJoin(artistTable, eq(artistTable.id, collectiveArtist.artistaId))
    .where(
      and(
        eq(collectiveArtist.agrupacionId, agrupacionId),
        eq(collectiveArtist.activo, true),
        isNull(artistTable.deletedAt)
      )
    )
    .orderBy(asc(artistTable.pseudonimo))
}
