'use server'

import 'server-only'
import * as nextCache from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import {
  BAND_ACTIVE_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { revalidateWebCacheBestEffort } from '@/shared/lib/web-invalidation'
import type { ActionState } from '@/shared/types/actions'
import {
  bandUpdateSchema,
  type BandUpdateInput
} from '../_schemas/banda.schema'

export async function updateBandaAction(
  data: BandUpdateInput
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = bandUpdateSchema.safeParse(data)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'banda',
          message: issue.message
        }))
      }
    }

    const { id, ...updateValues } = parsed.data
    let bandNameChanged = false

    await db.transaction(async (transaction) => {
      const [existingBand] = await transaction
        .select({ name: artist.band.name })
        .from(artist.band)
        .where(eq(artist.band.id, id))

      await transaction
        .update(artist.band)
        .set(updateValues)
        .where(eq(artist.band.id, id))

      bandNameChanged =
        existingBand !== undefined &&
        updateValues.name !== undefined &&
        existingBand.name !== updateValues.name
    })

    nextCache.updateTag?.(BAND_ACTIVE_CACHE_TAG)
    if (bandNameChanged) {
      void revalidateWebCacheBestEffort({
        tag: FESTIVAL_CRITICAL_CACHE_TAG,
        mode: 'immediate',
        path: '/festivales/[slug]',
        pathType: 'page'
      })
    }

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
