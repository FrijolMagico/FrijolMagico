'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import {
  type EventInsertInput,
  eventInsertSchema
} from '../_schemas/event.schema'
import type { ActionState } from '@/shared/types/actions'
import { EVENT_CACHE_TAG } from '../_constants'

const { event } = events

export async function createEventAction(
  _prevState: ActionState,
  data: EventInsertInput
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = eventInsertSchema.safeParse(data)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'evento',
          message: issue.message
        }))
      }
    }

    await db.insert(event).values(parsed.data)

    updateTag(EVENT_CACHE_TAG)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'eventos',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      ]
    }
  }
}
