'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { requireAuth } from '@/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { EVENT_CACHE_TAG } from '../_constants'

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

    await db.delete(event).where(eq(event.id, id))

    updateTag(EVENT_CACHE_TAG)
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
