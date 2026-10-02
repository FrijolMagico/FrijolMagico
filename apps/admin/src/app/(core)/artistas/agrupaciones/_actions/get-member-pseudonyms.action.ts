'use server'

import 'server-only'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, asc, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { requireAuth } from '@/shared/lib/auth/utils'

const { artistPseudonym, artistPrimaryPseudonym } = artist
const MAX_MEMBER_PSEUDONYMS = 100

export interface MemberPseudonymOption {
  id: number
  pseudonym: string
  isPrimary: boolean
}

export async function getMemberPseudonymsAction(
  artistId: number
): Promise<MemberPseudonymOption[]> {
  await requireAuth()
  const parsedArtistId = z.number().int().positive().safeParse(artistId)
  if (!parsedArtistId.success) return []

  const rows = await db
    .select({
      id: artistPseudonym.id,
      pseudonym: artistPseudonym.pseudonimo,
      primaryPseudonymId: artistPrimaryPseudonym.pseudonimoId
    })
    .from(artistPseudonym)
    .leftJoin(
      artistPrimaryPseudonym,
      eq(artistPrimaryPseudonym.artistaId, artistPseudonym.artistaId)
    )
    .where(
      and(
        eq(artistPseudonym.artistaId, parsedArtistId.data),
        isNull(artistPseudonym.deletedAt)
      )
    )
    .orderBy(asc(artistPseudonym.pseudonimo))
    .limit(MAX_MEMBER_PSEUDONYMS)

  return rows.map((row) => ({
    id: row.id,
    pseudonym: row.pseudonym,
    isPrimary: row.id === row.primaryPseudonymId
  }))
}
