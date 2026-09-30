import { cacheLife, cacheTag } from 'next/cache'

import {
  EDITION_CACHE_TAG,
  FESTIVALES_CACHE_TAG
} from '@frijolmagico/cache-tags'

import {
  adjacentFestivalsRepository,
  type AdjacentFestivalsResult
} from '../adapters/adjacentFestivalsRepository'

export type { AdjacentFestival } from '../adapters/adjacentFestivalsRepository'

export async function getAdjacentFestivals(
  slug: string
): Promise<AdjacentFestivalsResult> {
  'use cache: remote'
  cacheLife({ stale: 5 * 60, revalidate: Infinity, expire: Infinity })
  cacheTag(FESTIVALES_CACHE_TAG)
  cacheTag(EDITION_CACHE_TAG)

  return adjacentFestivalsRepository(slug)
}
