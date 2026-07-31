import 'server-only'

import { NextResponse } from 'next/server'

import { getSession } from '@/shared/lib/auth/utils'
import { uploadArtistAvatarAction } from '@/core/artistas/_actions/upload-artist-avatar.action'
import { parseAssetUpload } from '@/shared/assets-manager/server/multipart'
import { ValidationError } from '@/shared/assets-manager/server/validation-error'

export async function POST(request: Request) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await parseAssetUpload(request)

    if (payload.target !== 'artist-avatar') {
      return NextResponse.json(
        { error: 'Unsupported asset target' },
        { status: 400 }
      )
    }

    const result = await uploadArtistAvatarAction({
      artistaId: Number(payload.entityId),
      blob: payload.blob,
      width: payload.preparedWidth,
      height: payload.preparedHeight,
      expectedActive: payload.expectedActive
    })
    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.errors?.[0]?.message ?? 'Failed to process asset' },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data, { status: 200 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, field: error.field },
        { status: 400 }
      )
    }

    console.error('[assets] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
