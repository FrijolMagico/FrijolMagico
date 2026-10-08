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
import { revalidateWebCacheBatch } from '@/shared/lib/web-invalidation'

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

    const deletedEvents = await db
      .delete(event)
      .where(eq(event.id, id))
      .returning({ id: event.id })

    if (deletedEvents.length === 0) return { success: true }

    updateTag(EVENT_CACHE_TAG)
    const { webRevalidation } = await revalidateWebCacheBatch(
      [
        { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
        { tag: FESTIVALES_CACHE_TAG, mode: 'swr' },
        { tag: CATALOG_CACHE_TAG },
        { tag: CATALOG_PARTICIPATION_CACHE_TAG },
        { tag: CATALOG_EDITION_DATES_CACHE_TAG }
      ],
      'delete-event'
    )
    return {
      success: true,
      ...(webRevalidation ? { webRevalidation } : {})
    }
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
