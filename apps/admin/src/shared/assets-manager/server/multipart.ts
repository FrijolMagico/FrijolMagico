import type { AssetTarget } from '../client/contracts'

import { ValidationError } from './validation-error'

const MAX_CONTENT_LENGTH = 1.25 * 1024 * 1024 // 1.25 MiB

export interface AssetUploadPayload {
  target: AssetTarget
  entityId: string
  blob: Blob
  mimeType: 'image/webp'
  preparedWidth: number
  preparedHeight: number
}

function parseAssetTarget(value: string): AssetTarget {
  if (value !== 'artist-avatar' && value !== 'edition-poster') {
    throw new ValidationError(`Invalid asset target: ${value}`, 'assetTarget')
  }
  return value
}

function parsePositiveInt(value: string, field: string): number {
  const num = Number(value)
  if (!Number.isInteger(num) || num <= 0) {
    throw new ValidationError(`Invalid ${field}: must be a positive integer`, field)
  }
  return num
}

export async function parseAssetUpload(request: Request): Promise<AssetUploadPayload> {
  const contentLength = request.headers.get('content-length')

  if (contentLength) {
    const size = Number(contentLength)
    if (!Number.isFinite(size) || size > MAX_CONTENT_LENGTH) {
      throw new ValidationError(
        `Request size exceeds maximum allowed size of ${MAX_CONTENT_LENGTH} bytes`,
        'content-length',
      )
    }
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    throw new ValidationError('Failed to parse multipart form data', 'body')
  }

  const assetTargetRaw = formData.get('assetTarget')
  if (typeof assetTargetRaw !== 'string' || !assetTargetRaw) {
    throw new ValidationError('Missing or invalid assetTarget field', 'assetTarget')
  }
  const target = parseAssetTarget(assetTargetRaw)

  const entityId = formData.get('entityId')
  if (typeof entityId !== 'string' || !entityId) {
    throw new ValidationError('Missing or invalid entityId field', 'entityId')
  }

  const blob = formData.get('blob')
  if (!blob || !(blob instanceof Blob)) {
    throw new ValidationError('Missing or invalid blob field', 'blob')
  }

  if (blob.type !== 'image/webp' && blob.type !== '') {
    throw new ValidationError('Blob must be WebP format', 'blob')
  }

  const preparedWidthRaw = formData.get('preparedWidth')
  if (typeof preparedWidthRaw !== 'string') {
    throw new ValidationError('Missing or invalid preparedWidth field', 'preparedWidth')
  }
  const preparedWidth = parsePositiveInt(preparedWidthRaw, 'preparedWidth')

  const preparedHeightRaw = formData.get('preparedHeight')
  if (typeof preparedHeightRaw !== 'string') {
    throw new ValidationError('Missing or invalid preparedHeight field', 'preparedHeight')
  }
  const preparedHeight = parsePositiveInt(preparedHeightRaw, 'preparedHeight')

  return {
    target,
    entityId,
    blob,
    mimeType: 'image/webp',
    preparedWidth,
    preparedHeight,
  } as AssetUploadPayload
}
