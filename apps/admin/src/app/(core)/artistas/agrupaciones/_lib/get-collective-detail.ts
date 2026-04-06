import 'server-only'

import { cacheTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, asc, count, eq, inArray, isNull } from 'drizzle-orm'
import { ARTIST_CACHE_TAG } from '@/app/(core)/artistas/_constants'
import {
  AVAILABLE_ARTISTS_PRELOAD_THRESHOLD,
  getCollectiveMembersCacheTag
} from '../_constants'
import type {
  ArtistOption,
  CollectiveDetailResult,
  MemberDraftItem,
  MembersByCollectiveId
} from '../_types/collective.types'

const { artist: artistTable, collectiveArtist } = artist

function createMembersByCollectiveId(
  collectiveIds: number[]
): MembersByCollectiveId {
  return Object.fromEntries(
    collectiveIds.map((collectiveId) => [collectiveId, []])
  ) as MembersByCollectiveId
}

function mapMemberRowToDraftItem(row: {
  artistId: number
  pseudonym: string
  city: string | null
  role: string | null
  active: boolean
}): MemberDraftItem {
  return {
    artistId: row.artistId,
    pseudonym: row.pseudonym,
    city: row.city,
    role: row.role,
    active: row.active
  }
}

export async function getCollectiveDetail(
  collectiveIds: number[],
  threshold = AVAILABLE_ARTISTS_PRELOAD_THRESHOLD
): Promise<CollectiveDetailResult> {
  'use cache'

  cacheTag(ARTIST_CACHE_TAG)

  for (const collectiveId of collectiveIds) {
    cacheTag(getCollectiveMembersCacheTag(collectiveId))
  }

  const membersByCollectiveId = createMembersByCollectiveId(collectiveIds)

  const activeArtistCountPromise = db
    .select({ total: count() })
    .from(artistTable)
    .where(isNull(artistTable.deletedAt))

  const memberRowsPromise =
    collectiveIds.length === 0
      ? Promise.resolve([])
      : db
          .select({
            collectiveId: collectiveArtist.agrupacionId,
            artistId: collectiveArtist.artistaId,
            role: collectiveArtist.rol,
            active: collectiveArtist.activo,
            pseudonym: artistTable.pseudonimo,
            city: artistTable.ciudad
          })
          .from(collectiveArtist)
          .innerJoin(artistTable, eq(artistTable.id, collectiveArtist.artistaId))
          .where(
            and(
              inArray(collectiveArtist.agrupacionId, collectiveIds),
              eq(collectiveArtist.activo, true),
              isNull(artistTable.deletedAt)
            )
          )
          .orderBy(asc(artistTable.pseudonimo))

  const [activeArtistCountResult, memberRows] = await Promise.all([
    activeArtistCountPromise,
    memberRowsPromise
  ])

  for (const memberRow of memberRows) {
    membersByCollectiveId[memberRow.collectiveId] ??= []
    membersByCollectiveId[memberRow.collectiveId].push(
      mapMemberRowToDraftItem(memberRow)
    )
  }

  const activeArtistCount = activeArtistCountResult[0]?.total ?? 0

  if (activeArtistCount > threshold) {
    return {
      membersByCollectiveId,
      availableArtists: null
    }
  }

  const availableArtists: ArtistOption[] = await db
    .select({
      id: artistTable.id,
      pseudonym: artistTable.pseudonimo,
      city: artistTable.ciudad
    })
    .from(artistTable)
    .where(isNull(artistTable.deletedAt))
    .orderBy(asc(artistTable.pseudonimo))

  return {
    membersByCollectiveId,
    availableArtists
  }
}
