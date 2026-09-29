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
  EVENT_CACHE_TAG
} from '@frijolmagico/cache-tags'
import {
  revalidateWebCache,
  revalidateWebCacheBestEffort
} from '@/shared/lib/web-invalidation'

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

    const [existingEvent] = await db
      .select({ nombre: event.nombre })
      .from(event)
      .where(eq(event.id, data.id))
      .limit(1)

    await db.update(event).set(parsed.data).where(eq(event.id, data.id))

    if (
      parsed.data.nombre !== undefined &&
      existingEvent?.nombre !== parsed.data.nombre
    ) {
      void revalidateWebCacheBestEffort({ tag: CATALOG_CACHE_TAG })
    }

    updateTag(EVENT_CACHE_TAG)
    try {
      await revalidateWebCache({ tag: EVENT_CACHE_TAG })
    } catch {
      console.error('[event-crud] Web cache sync failed', {
        tag: EVENT_CACHE_TAG
      })
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
