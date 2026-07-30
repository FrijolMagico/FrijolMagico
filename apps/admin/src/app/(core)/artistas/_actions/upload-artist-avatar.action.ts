'use server'

import 'server-only'

import { z } from 'zod'

import { createArtistAvatarUploadReceipt } from '../catalogo/_lib/artist-avatar-upload-receipt'
import { requireAuth } from '@/shared/lib/auth/utils'
import {
  R2Adapter,
  createR2Config
} from '@/shared/assets-manager/server/r2-adapter'
import type { ActionState } from '@/shared/types/actions'
import type { ExpectedActiveAvatar } from '../catalogo/_lib/avatar-history-contracts'

const schema = z
  .object({
    artistaId: z.number().int().positive(),
    blob: z.instanceof(Blob).refine((blob) => blob.type === 'image/webp', {
      message: 'El avatar debe estar en formato WebP'
    }),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    expectedActive: z
      .object({
        id: z.number().int().positive(),
        path: z.string().min(1),
        version: z.string().nullable()
      })
      .nullable()
      .optional(),
    catalogId: z.number().int().positive().optional(),
    requestedActive: z.boolean().optional()
  })
  .refine((input) => input.width === 800 && input.height === 800, {
    message: 'El avatar preparado debe medir exactamente 800×800 px'
  })

export type UploadArtistAvatarInput = z.infer<typeof schema>

export interface UploadArtistAvatarData {
  id: number
  artistaId: number
  path: string
  version: string | null
  oldAsset: { path: string; version: string | null } | null
}

export interface UploadArtistAvatarReceiptData {
  receipt: string
}

function getStore(): R2Adapter {
  return new R2Adapter(createR2Config())
}

function receiptSecret(): string {
  const secret = process.env.ASSET_RECEIPT_SECRET
  if (!secret) throw new Error('ASSET_RECEIPT_SECRET is not configured')
  return secret
}

export async function uploadArtistAvatarAction(
  input: UploadArtistAvatarInput
): Promise<ActionState<UploadArtistAvatarReceiptData>> {
  try {
    const session = await requireAuth()
    const parsed = schema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'artist-avatar',
          message: issue.message
        }))
      }
    }

    const version = crypto.randomUUID()
    const path = `artistas/${parsed.data.artistaId}/avatar-${version}.webp`
    await getStore().putObject(path, parsed.data.blob)
    const receipt = createArtistAvatarUploadReceipt(
      {
        subjectId: session.user.id,
        artistaId: parsed.data.artistaId,
        path,
        version,
        expectedActive: parsed.data.expectedActive as
          | ExpectedActiveAvatar
          | null
          | undefined,
        catalogId: parsed.data.catalogId,
        requestedActive: parsed.data.requestedActive
      },
      receiptSecret()
    )
    return { success: true, data: { receipt } }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'artist-avatar',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      ]
    }
  }
}
