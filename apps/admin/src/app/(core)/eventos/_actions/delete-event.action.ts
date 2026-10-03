'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import {
  CATALOG_CACHE_TAG,
  CATALOG_EDITION_DATES_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { revalidateWebCache } from '@/shared/lib/web-invalidation'
import { getActiveFestivalDisplay } from '@frijolmagico/database/active-festival-display'
import { invalidateActiveFestivalDisplay } from '../_lib/active-festival-invalidation'

const { event } = events

export async function deleteEventAction(id: number): Promise<ActionState> {
  try {
    await requireAuth()

    if (!id || isNaN(id)) {
      return {
        success: false,
        errors: [{ entityType: 'evento', message: 'ID de evento inválido' }]
      }
    }

    const { deletedEvents, before, after } = await db.transaction(async (tx) => {
      const before = await getActiveFestivalDisplay(tx)
      const deletedEvents = await tx
        .delete(event)
        .where(eq(event.id, id))
        .returning({ id: event.id })
      const after = await getActiveFestivalDisplay(tx)
      return { deletedEvents, before, after }
    })

    if (deletedEvents.length === 0) return { success: true }

    await invalidateActiveFestivalDisplay(before, after)
    updateTag(EVENT_CACHE_TAG)
    for (const [tag, mode] of [
      [FESTIVAL_CRITICAL_CACHE_TAG, 'immediate'],
      [FESTIVALES_CACHE_TAG, 'swr']
    ] as const) {
      try {
        await revalidateWebCache({
          tag,
          mode,
          ...(tag === FESTIVAL_CRITICAL_CACHE_TAG
            ? { path: '/festivales/[slug]', pathType: 'page' as const }
            : { path: '/festivales', pathType: 'page' as const })
        })
      } catch {
        console.error('[event-crud] Web cache sync failed', { tag })
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
        console.error('[event-crud] Web cache sync failed', { tag })
      }
    }
    return { success: true }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'evento',
          message:
            'Error del servidor al intentar eliminar el evento, envíale una captura de pantalla al Nachito pls'
        },
        {
          entityType: 'evento',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      ]
    }
  }
}
