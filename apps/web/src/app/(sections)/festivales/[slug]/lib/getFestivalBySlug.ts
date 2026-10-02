import { notFound } from 'next/navigation'
import { cacheLife, cacheTag } from 'next/cache'

import { FESTIVAL_CRITICAL_CACHE_TAG } from '@frijolmagico/cache-tags'

import { festivalDetailRepository } from '../adapters/festivalDetailRepository'

import type { FestivalDetail } from '../../types/festival'

export async function getFestivalBySlug(slug: string): Promise<FestivalDetail> {
  'use cache: remote'
  cacheLife({ stale: 5 * 60, revalidate: Infinity, expire: Infinity })
  cacheTag(FESTIVAL_CRITICAL_CACHE_TAG)

  const detail = await festivalDetailRepository(slug)

  if (!detail) {
    notFound()
  }

  return detail
}
