import { notFound } from 'next/navigation'
import { cacheTag } from 'next/cache'

import {
  EDITION_CACHE_TAG,
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG
} from '@frijolmagico/cache-tags'

import { festivalDetailRepository } from '../adapters/festivalDetailRepository'

import type { FestivalDetail } from '../../types/festival'

export async function getFestivalBySlug(slug: string): Promise<FestivalDetail> {
  'use cache'
  cacheTag(FESTIVALES_CACHE_TAG)
  cacheTag(EVENT_CACHE_TAG)
  cacheTag(EDITION_CACHE_TAG)

  const detail = await festivalDetailRepository(slug)

  if (!detail) {
    notFound()
  }

  return detail
}
