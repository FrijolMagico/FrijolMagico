'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import {
  type EventUpdateInput,
  eventUpdateSchema
} from '../_schemas/event.schema'
import type { ActionState } from '@/shared/types/actions'
import {
  CATALOG_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'
import {
  revalidateWebCache,
  revalidateWebCacheBestEffort
} from '@/shared/lib/web-invalidation'
import { getActiveFestivalDisplay } from '@frijolmagico/database/active-festival-display'
import { invalidateActiveFestivalDisplay } from '../_lib/active-festival-invalidation'

const { event } = events

export async function updateEventAction(
  _prevState: ActionState,
  data: EventUpdateInput
): Promise<ActionState> {
  try {
    await requireAuth()

    if (!data.id) {
      return {
        success: false,
        errors: [{ entityType: 'evento', message: 'ID de evento inválido' }]
      }
    }

    const parsed = eventUpdateSchema.safeParse(data)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'evento',
          message: issue.message
        }))
      }
    }

    const eventId = data.id
    const { updatedEvents, before, after, existingEvent } = await db.transaction(async (tx) => {
      const before = await getActiveFestivalDisplay(tx)
      const [existingEvent] = await tx
        .select({ nombre: event.nombre })
        .from(event)
        .where(eq(event.id, eventId))
        .limit(1)
      const updatedEvents = await tx
        .update(event)
        .set(parsed.data)
        .where(eq(event.id, eventId))
        .returning({ id: event.id })
      const after = await getActiveFestivalDisplay(tx)
      return { updatedEvents, before, after, existingEvent }
    })

    if (
      updatedEvents.length > 0 &&
      parsed.data.nombre !== undefined &&
      existingEvent?.nombre !== parsed.data.nombre
    ) {
      void revalidateWebCacheBestEffort({ tag: CATALOG_CACHE_TAG })
      void revalidateWebCacheBestEffort({
        tag: CATALOG_PARTICIPATION_CACHE_TAG
      })
    }

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
          ...(updatedEvents.length > 0
            ? tag === FESTIVAL_CRITICAL_CACHE_TAG
              ? { path: '/festivales/[slug]', pathType: 'page' as const }
              : { path: '/festivales', pathType: 'page' as const }
            : {})
        })
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
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      ]
    }
  }
}
