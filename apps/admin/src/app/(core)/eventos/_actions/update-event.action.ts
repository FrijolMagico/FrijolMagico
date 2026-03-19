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
import { EVENT_CACHE_TAG } from '../_constants'

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

    await db.update(event).set(parsed.data).where(eq(event.id, data.id))

    updateTag(EVENT_CACHE_TAG)
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
