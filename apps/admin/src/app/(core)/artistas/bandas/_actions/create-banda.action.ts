'use server'

import 'server-only'
import * as nextCache from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { BAND_ACTIVE_CACHE_TAG } from '../_constants'
import {
  bandInsertSchema,
  type BandInsertInput
} from '../_schemas/banda.schema'

export async function createBandaAction(
  data: BandInsertInput
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = bandInsertSchema.safeParse(data)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'banda',
          message: issue.message
        }))
      }
    }

    await db.insert(artist.band).values(parsed.data)

    nextCache.updateTag?.(BAND_ACTIVE_CACHE_TAG)

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
