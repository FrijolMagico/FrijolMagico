'use server'

import 'server-only'
import * as nextCache from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { BAND_ACTIVE_CACHE_TAG, BAND_DELETED_CACHE_TAG } from '../_constants'

export async function restoreBandaAction(id: number): Promise<ActionState> {
  try {
    await requireAuth()

    if (!id || Number.isNaN(id)) {
      return {
        success: false,
        errors: [{ entityType: 'banda', message: 'ID de banda inválido' }]
      }
    }

    await db
      .update(artist.band)
      .set({ deletedAt: null })
      .where(eq(artist.band.id, id))

    nextCache.updateTag?.(BAND_ACTIVE_CACHE_TAG)
    nextCache.updateTag?.(BAND_DELETED_CACHE_TAG)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'banda',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      ]
    }
  }
}
