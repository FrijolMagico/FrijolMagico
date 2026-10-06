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
import {
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { revalidateWebCacheBatch } from '@/shared/lib/web-invalidation'

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
    const webInvalidation = await revalidateWebCacheBatch(
      [
        {
          tag: FESTIVAL_CRITICAL_CACHE_TAG,
          mode: 'immediate',
          path: '/festivales/[slug]',
          pathType: 'page'
        },
        {
          tag: FESTIVALES_CACHE_TAG,
          mode: 'swr',
          path: '/festivales',
          pathType: 'page'
        },
        { path: '/', pathType: 'page' },
        { path: '/', pathType: 'layout' }
      ],
      'create-event'
    )
    return { success: true, ...webInvalidation }
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
