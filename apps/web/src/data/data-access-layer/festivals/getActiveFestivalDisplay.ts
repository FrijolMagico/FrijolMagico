import { cacheLife, cacheTag } from 'next/cache'
import { FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG } from '@frijolmagico/cache-tags'
import { readActiveFestivalDisplay } from './active-festival-display-query'

export async function getActiveFestivalDisplay() {
  'use cache: remote'
  cacheLife({ stale: 5 * 60, revalidate: Infinity, expire: Infinity })
  cacheTag(FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG)

  return readActiveFestivalDisplay()
}
