'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, eq } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import {
  AGRUPACION_ACTIVE_CACHE_TAG,
  AGRUPACION_CACHE_TAG,
  getAgrupacionMembersCacheTag
} from '../_constants'
import { memberInsertSchema } from '../_schemas/member.schema'

const { collectiveArtist } = artist

export async function addMemberAction(
  _prevState: ActionState,
  data: {
    agrupacionId: number
    artistaId: number
    rol?: string | null
    activo?: boolean
  }
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = memberInsertSchema.safeParse({
      agrupacionId: data.agrupacionId,
      artistaId: data.artistaId,
      rol: data.rol ?? null,
      activo: data.activo ?? true
    })

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'agrupacion_artista',
          message: issue.message
        }))
      }
    }

    await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({
          agrupacionId: collectiveArtist.agrupacionId,
          artistaId: collectiveArtist.artistaId
        })
        .from(collectiveArtist)
        .where(
          and(
            eq(collectiveArtist.agrupacionId, parsed.data.agrupacionId),
            eq(collectiveArtist.artistaId, parsed.data.artistaId)
          )
        )

      if (existing) {
        await tx
          .update(collectiveArtist)
          .set({
            activo: true,
            rol: parsed.data.rol ?? null
          })
          .where(
            and(
              eq(collectiveArtist.agrupacionId, parsed.data.agrupacionId),
              eq(collectiveArtist.artistaId, parsed.data.artistaId)
            )
          )

        return
      }

      await tx.insert(collectiveArtist).values(parsed.data)
    })

    updateTag(AGRUPACION_CACHE_TAG)
    updateTag(AGRUPACION_ACTIVE_CACHE_TAG)
    updateTag(getAgrupacionMembersCacheTag(parsed.data.agrupacionId))

    return { success: true }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'agrupacion_artista',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      ]
    }
  }
}
