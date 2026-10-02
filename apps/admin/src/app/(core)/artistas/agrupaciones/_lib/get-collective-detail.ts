import 'server-only'

import { cacheTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, asc, count, eq, inArray, isNull } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import {
  ARTIST_CACHE_TAG,
  getCollectiveMembersCacheTag
} from '@frijolmagico/cache-tags'
import { AVAILABLE_ARTISTS_PRELOAD_THRESHOLD } from '../_constants'
import type {
  ArtistOption,
  CollectiveDetailResult,
  MemberDraftItem,
  MembersByCollectiveId
} from '../_types/collective.types'

const {
  artist: artistTable,
  artistPseudonym,
  artistPrimaryPseudonym,
  collectiveArtist
} = artist
const memberPseudonym = alias(artistPseudonym, 'member_pseudonym')

function createMembersByCollectiveId(
  collectiveIds: number[]
): MembersByCollectiveId {
  return Object.fromEntries(
    collectiveIds.map((collectiveId) => [collectiveId, []])
  ) as MembersByCollectiveId
}

function mapMemberRowToDraftItem(row: {
  artistId: number
  pseudonymId: number | null
  primaryPseudonymId: number | null
  selectedPseudonym: string | null
  pseudonym: string | null
  legacyPseudonym: string
  city: string | null
  role: string | null
  active: boolean
}): MemberDraftItem {
  return {
    artistId: row.artistId,
    pseudonymId: row.pseudonymId ?? row.primaryPseudonymId,
    pseudonym: row.selectedPseudonym ?? row.pseudonym ?? row.legacyPseudonym,
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
            pseudonymId: collectiveArtist.pseudonimoId,
            primaryPseudonymId: artistPrimaryPseudonym.pseudonimoId,
            selectedPseudonym: memberPseudonym.pseudonimo,
            pseudonym: artistPseudonym.pseudonimo,
            legacyPseudonym: artistTable.pseudonimo,
            city: artistTable.ciudad
          })
          .from(collectiveArtist)
          .innerJoin(
            artistTable,
            eq(artistTable.id, collectiveArtist.artistaId)
          )
          .leftJoin(
            artistPrimaryPseudonym,
            eq(artistPrimaryPseudonym.artistaId, artistTable.id)
          )
          .leftJoin(
            artistPseudonym,
            and(
              eq(artistPseudonym.id, artistPrimaryPseudonym.pseudonimoId),
              isNull(artistPseudonym.deletedAt)
            )
          )
          .leftJoin(
            memberPseudonym,
            and(
              eq(memberPseudonym.id, collectiveArtist.pseudonimoId),
              eq(memberPseudonym.artistaId, collectiveArtist.artistaId),
              isNull(memberPseudonym.deletedAt)
            )
          )
          .where(
            and(
              inArray(collectiveArtist.agrupacionId, collectiveIds),
              eq(collectiveArtist.activo, true),
              isNull(artistTable.deletedAt)
            )
          )
          .orderBy(asc(artistPseudonym.pseudonimo), asc(artistTable.pseudonimo))

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

  const availableArtistRows = await db
    .select({
      id: artistTable.id,
      pseudonym: artistPseudonym.pseudonimo,
      legacyPseudonym: artistTable.pseudonimo,
      city: artistTable.ciudad
    })
    .from(artistTable)
    .leftJoin(
      artistPrimaryPseudonym,
      eq(artistPrimaryPseudonym.artistaId, artistTable.id)
    )
    .leftJoin(
      artistPseudonym,
      and(
        eq(artistPseudonym.id, artistPrimaryPseudonym.pseudonimoId),
        isNull(artistPseudonym.deletedAt)
      )
    )
    .where(isNull(artistTable.deletedAt))
    .orderBy(asc(artistPseudonym.pseudonimo), asc(artistTable.pseudonimo))

  const availableArtists: ArtistOption[] = availableArtistRows.map((row) => ({
    id: row.id,
    pseudonym: row.pseudonym ?? row.legacyPseudonym,
    aliasLabel: null,
    city: row.city
  }))

  return {
    membersByCollectiveId,
    availableArtists
  }
}
