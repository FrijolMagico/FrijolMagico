import 'server-only'

import { NextResponse } from 'next/server'

import { getSession } from '@/shared/lib/auth/utils'
import { parseAssetUpload } from '@/shared/assets-manager/server/multipart'
import { validatePreparedSize } from '@/shared/assets-manager/server/validation'
import { R2Adapter, createR2Config } from '@/shared/assets-manager/server/r2-adapter'
import { ValidationError } from '@/shared/assets-manager/server/validation-error'
import { AssetStoreError } from '@/shared/assets-manager/server/asset-store-error'

function getStore(): R2Adapter {
  const config = createR2Config()
  return new R2Adapter(config)
}

export async function POST(request: Request) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await parseAssetUpload(request)

    validatePreparedSize(payload.target, payload.preparedWidth, payload.preparedHeight)

    const store = getStore()
    const ref = await store.uploadAsset(
      payload.target,
      payload.entityId,
      payload.blob,
      payload.mimeType,
    )

    return NextResponse.json(ref, { status: 200 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, field: error.field },
        { status: 400 },
      )
    }

    if (error instanceof AssetStoreError) {
      console.error('[assets] AssetStore error:', error)
      return NextResponse.json({ error: 'Failed to process asset' }, { status: 500 })
    }

    console.error('[assets] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await parseAssetUpload(request)

    validatePreparedSize(payload.target, payload.preparedWidth, payload.preparedHeight)

    const formData = await request.formData()
    const currentPathRaw = formData.get('currentPath')
    const currentVersionRaw = formData.get('currentVersion')
    const currentRef = {
      path: typeof currentPathRaw === 'string' ? currentPathRaw : null,
      version: typeof currentVersionRaw === 'string' ? currentVersionRaw : null,
    }

    const store = getStore()
    const ref = await store.replaceAsset(
      payload.target,
      payload.entityId,
      currentRef,
      payload.blob,
      payload.mimeType,
    )

    return NextResponse.json(ref, { status: 200 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, field: error.field },
        { status: 400 },
      )
    }

    if (error instanceof AssetStoreError) {
      console.error('[assets] AssetStore error:', error)
      return NextResponse.json({ error: 'Failed to process asset' }, { status: 500 })
    }

    console.error('[assets] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const version = searchParams.get('version')

    if (!path || !version) {
      return NextResponse.json(
        { error: 'Missing required query parameters: path, version' },
        { status: 400 },
      )
    }

    const ref = { path, version }
    const store = getStore()
    await store.deleteAsset('artist-avatar', '', ref)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    if (error instanceof AssetStoreError) {
      console.error('[assets] AssetStore error:', error)
      return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
    }

    console.error('[assets] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
