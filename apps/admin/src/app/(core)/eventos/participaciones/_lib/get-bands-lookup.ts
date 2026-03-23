import 'server-only'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { asc, isNull } from 'drizzle-orm'

import { BAND_ACTIVE_CACHE_TAG } from '@/core/artistas/bandas/_constants'

import type { BandLookup } from '../_types'

const { band } = artist

export async function getBandsLookup(): Promise<Map<number, BandLookup>> {
  'use cache'
  cacheTag(BAND_ACTIVE_CACHE_TAG)

  const results = await db
    .select({
      id: band.id,
      name: band.name,
      email: band.email,
      phone: band.phone,
      city: band.city
    })
    .from(band)
    .where(isNull(band.deletedAt))
    .orderBy(asc(band.name))

  return new Map(results.map((row) => [row.id, row]))
}
