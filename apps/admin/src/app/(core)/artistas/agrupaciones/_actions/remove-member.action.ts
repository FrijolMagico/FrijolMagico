'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, eq } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { getAgrupacionMembersCacheTag } from '../_constants'
import { memberRemoveSchema } from '../_schemas/member.schema'

const { collectiveArtist } = artist

export async function removeMemberAction(
  _prevState: ActionState,
  data: { agrupacionId: number; artistaId: number }
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = memberRemoveSchema.safeParse(data)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'agrupacion_artista',
          message: issue.message
        }))
      }
    }

    await db
      .update(collectiveArtist)
      .set({ activo: false })
      .where(
        and(
          eq(collectiveArtist.agrupacionId, parsed.data.agrupacionId),
          eq(collectiveArtist.artistaId, parsed.data.artistaId)
        )
      )

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
