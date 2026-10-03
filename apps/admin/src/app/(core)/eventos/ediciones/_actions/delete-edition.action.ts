'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { revalidateWebCache } from '@/shared/lib/web-invalidation'
import {
  getActiveFestivalDisplay,
  type ActiveFestivalDisplay
} from '@frijolmagico/database/active-festival-display'
import { invalidateActiveFestivalDisplay } from '../../_lib/active-festival-invalidation'
import {
  CATALOG_CACHE_TAG,
  CATALOG_EDITION_DATES_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  EDITION_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG,
  EDITION_DAY_CACHE_TAG
} from '@frijolmagico/cache-tags'

const { eventEdition } = events

export async function deleteEditionAction(
  _prevState: ActionState<void>,
  payload: { id: number }
): Promise<ActionState<void>> {
  await requireAuth()

  const id = payload.id
  if (!id || isNaN(id)) {
    return {
      success: false,
      errors: [{ entityType: 'edicion', message: 'ID inválido' }]
    }
  }

  let activeFestivalSnapshots: [ActiveFestivalDisplay | null, ActiveFestivalDisplay | null] = [null, null]
  const deletedEditions = await db.transaction(async (tx) => {
    const before = await getActiveFestivalDisplay(tx)
    const deletedEditions = await tx
      .delete(eventEdition)
      .where(eq(eventEdition.id, id))
      .returning({ id: eventEdition.id, slug: eventEdition.slug })
    activeFestivalSnapshots = [before, await getActiveFestivalDisplay(tx)]
    return deletedEditions
  })

  if (deletedEditions.length === 0) return { success: true }

  await invalidateActiveFestivalDisplay(...activeFestivalSnapshots)
  updateTag(EDITION_CACHE_TAG)
  updateTag(EDITION_DAY_CACHE_TAG)
  for (const [tag, mode] of [
    [FESTIVAL_CRITICAL_CACHE_TAG, 'immediate'],
    [FESTIVALES_CACHE_TAG, 'swr']
  ] as const) {
    try {
      await revalidateWebCache({ tag, mode })
    } catch {
      console.error('[delete-edition] Web cache sync failed', { tag })
    }
  }
  for (const { slug } of deletedEditions) {
    if (slug) {
      try {
        await revalidateWebCache({
          tag: FESTIVAL_CRITICAL_CACHE_TAG,
          path: `/festivales/${slug}`
        })
      } catch {
        console.error('[delete-edition] Web cache sync failed', {
          tag: FESTIVAL_CRITICAL_CACHE_TAG
        })
      }
    }
    try {
      await revalidateWebCache({ tag: FESTIVALES_CACHE_TAG, path: '/festivales' })
    } catch {
      console.error('[delete-edition] Web cache sync failed', { tag: FESTIVALES_CACHE_TAG })
    }
  }
  for (const tag of [
    CATALOG_CACHE_TAG,
    CATALOG_PARTICIPATION_CACHE_TAG,
    CATALOG_EDITION_DATES_CACHE_TAG
  ]) {
    try {
      await revalidateWebCache({ tag })
    } catch {
      console.error('[delete-edition] Web cache sync failed', { tag })
    }
  }

  return { success: true }
}
