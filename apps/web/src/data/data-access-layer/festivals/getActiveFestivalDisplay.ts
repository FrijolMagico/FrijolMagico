import { cacheLife, cacheTag } from 'next/cache'
import { FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG } from '@frijolmagico/cache-tags'
import { db } from '@frijolmagico/database/orm'
import { getActiveFestivalDisplay as readActiveFestivalDisplay } from '@frijolmagico/database/active-festival-display'

export async function getActiveFestivalDisplay() {
  'use cache: remote'
  cacheLife({ stale: 5 * 60, revalidate: Infinity, expire: Infinity })
  cacheTag(FESTIVAL_ACTIVE_DISPLAY_CACHE_TAG)

  return db.transaction(async (tx) => readActiveFestivalDisplay(tx))
}
