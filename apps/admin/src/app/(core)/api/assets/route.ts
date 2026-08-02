import 'server-only'

import { NextResponse } from 'next/server'

import type { ExpectedActiveAvatar } from '@/core/artistas/catalogo/_lib/avatar-history-contracts'
import { getSession } from '@/shared/lib/auth/utils'
import { uploadArtistAvatarAction } from '@/core/artistas/_actions/upload-artist-avatar.action'
import { parseAssetUpload } from '@/shared/assets-manager/server/multipart'
import { ValidationError } from '@/shared/assets-manager/server/validation-error'

function getRequiredPositiveInt(fields: FormData, field: string): number {
  const value = fields.get(field)
  const number = typeof value === 'string' ? Number(value) : NaN
  if (!Number.isInteger(number) || number <= 0) {
    throw new ValidationError(`Missing or invalid ${field} field`, field)
  }
  return number
}

function getOptionalPositiveInt(
  fields: FormData,
  field: string
): number | undefined {
  const value = fields.get(field)
  if (typeof value !== 'string') return undefined
  const number = Number(value)
  if (!Number.isInteger(number) || number <= 0) {
    throw new ValidationError(
      `Invalid ${field}: must be a positive integer`,
      field
    )
  }
  return number
}

function parseRequestedActive(fields: FormData): boolean | undefined {
  const value = fields.get('requestedActive')
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

function parseExpectedActive(
  fields: FormData
): ExpectedActiveAvatar | null | undefined {
  const expectedNone = fields.get('expectedActiveNone')
  const id = fields.get('expectedActiveId')
  const path = fields.get('expectedActivePath')
  const version = fields.get('expectedActiveVersion')

  if (
    expectedNone === 'true' &&
    id === null &&
    path === null &&
    version === null
  ) {
    return null
  }
  if (id === null && path === null && version === null) return undefined
  if (
    typeof id !== 'string' ||
    typeof path !== 'string' ||
    typeof version !== 'string'
  ) {
    throw new ValidationError(
      'Invalid expected active avatar',
      'expectedActive'
    )
  }

  const parsedId = Number(id)
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new ValidationError(
      'Invalid expected active avatar',
      'expectedActive'
    )
  }
  return { id: parsedId, path, version: version || null }
}

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
      artistaId: getRequiredPositiveInt(payload.fields, 'entityId'),
      slug: '',
      blob: payload.blob,
      width: getRequiredPositiveInt(payload.fields, 'preparedWidth'),
      height: getRequiredPositiveInt(payload.fields, 'preparedHeight'),
      expectedActive: parseExpectedActive(payload.fields),
      catalogId: getOptionalPositiveInt(payload.fields, 'catalogId'),
      requestedActive: parseRequestedActive(payload.fields)
    })
    if (!result.success || !result.data) {
      const error = result.errors?.[0]
      return NextResponse.json(
        { error: error?.message ?? 'Failed to process asset' },
        { status: error?.entityType === 'AVATAR_CONFLICT' ? 409 : 400 }
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
