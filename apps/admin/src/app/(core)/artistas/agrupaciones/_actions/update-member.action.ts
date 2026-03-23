'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, eq } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { getAgrupacionMembersCacheTag } from '../_constants'
import { memberActionSchema } from '../_schemas/member.schema'

const { collectiveArtist } = artist

export async function updateMemberAction(
  _prevState: ActionState,
  data: {
    agrupacionId: number
    artistaId: number
    rol?: string | null
    activo: boolean
  }
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = memberActionSchema.safeParse(data)

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
      .set({
        rol: parsed.data.rol ?? null,
        activo: parsed.data.activo ?? true
      })
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
