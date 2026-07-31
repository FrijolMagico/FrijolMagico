'use server'

import 'server-only'

import { z } from 'zod'

import { and, eq } from 'drizzle-orm'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'

import {
  INVALID_RECEIPT,
  verifyArtistAvatarUploadReceipt
} from '../catalogo/_lib/artist-avatar-upload-receipt'
import { requireAuth } from '@/shared/lib/auth/utils'
import { getAssetReceiptSecret } from '@/shared/assets-manager/server/asset-receipt-config'
import {
  R2Adapter,
  createR2Config
} from '@/shared/assets-manager/server/r2-adapter'
import type { ActionState } from '@/shared/types/actions'

const schema = z.object({ receipt: z.string().min(1) })

export async function discardArtistAvatarAction(
  input: unknown
): Promise<ActionState<null>> {
  try {
    const session = await requireAuth()
    const parsed = schema.safeParse(input)
    if (!parsed.success) throw new Error(INVALID_RECEIPT)
    const claims = verifyArtistAvatarUploadReceipt(parsed.data.receipt, {
      secret: getAssetReceiptSecret(),
      subjectId: session.user.id,
      purpose: 'cleanup'
    })
    const [persisted] = await db
      .select({ id: artist.artistImage.id })
      .from(artist.artistImage)
      .where(
        and(
          eq(artist.artistImage.artistaId, claims.artistaId),
          eq(artist.artistImage.imagenUrl, claims.path),
          eq(artist.artistImage.artistAvatarVersion, claims.version),
          eq(artist.artistImage.tipo, 'avatar')
        )
      )
      .limit(1)
    if (persisted) return { success: true, data: null }
    await new R2Adapter(createR2Config()).deleteObject(claims.path)
    return { success: true, data: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return {
      success: false,
      errors: [
        {
          entityType:
            message === INVALID_RECEIPT ? INVALID_RECEIPT : 'artist-avatar',
          message
        }
      ]
    }
  }
}
