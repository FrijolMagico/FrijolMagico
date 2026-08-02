'use server'

import 'server-only'

import { createArtistAvatarUploadReceipt } from '../catalogo/_lib/artist-avatar-upload-receipt'
import {
  createArtistAvatarKey,
  parseArtistAvatarUpload,
  type ArtistAvatarUpload
} from '../_lib/artist-avatar-lifecycle'
import { resolveArtistAvatar } from '../_lib/artist-avatar-resolver'
import { requireAuth } from '@/shared/lib/auth/utils'
import {
  R2Adapter,
  createR2Config
} from '@/shared/assets-manager/server/r2-adapter'
import { getAssetReceiptSecret } from '@/shared/assets-manager/server/asset-receipt-config'
import type { ActionState } from '@/shared/types/actions'
export type UploadArtistAvatarInput = Omit<ArtistAvatarUpload, 'artistId'> & {
  artistaId: number
  slug?: string
}

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

export async function uploadArtistAvatarAction(
  input: UploadArtistAvatarInput
): Promise<ActionState<UploadArtistAvatarReceiptData>> {
  try {
    const session = await requireAuth()
    const parsed = parseArtistAvatarUpload({
      ...input,
      artistId: input.artistaId
    })
    const artist = await resolveArtistAvatar(parsed.artistId)
    const { path, version } = createArtistAvatarKey(artist.canonicalSlug)
    await getStore().putObject(path, parsed.blob)
    const receipt = createArtistAvatarUploadReceipt(
      {
        subjectId: session.user.id,
        artistaId: artist.artistId,
        path,
        version,
        expectedActive: parsed.expectedActive,
        catalogId: parsed.catalogId,
        requestedActive: parsed.requestedActive
      },
      getAssetReceiptSecret()
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
