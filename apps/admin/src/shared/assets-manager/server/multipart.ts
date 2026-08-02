import type { AssetTarget } from '../client/contracts'

import { ValidationError } from './validation-error'

const MAX_CONTENT_LENGTH = 1.25 * 1024 * 1024

export interface MultipartEnvelope {
  target: AssetTarget
  entityId: string
  blob: Blob
  fields: FormData
}

function parseAssetTarget(value: string): AssetTarget {
  if (value !== 'artist-avatar' && value !== 'edition-poster') {
    throw new ValidationError(`Invalid asset target: ${value}`, 'assetTarget')
  }
  return value
}

function validateContentLength(request: Request): void {
  const contentLength = request.headers.get('content-length')
  if (!contentLength) return

  const size = Number(contentLength)
  if (!Number.isFinite(size) || size > MAX_CONTENT_LENGTH) {
    throw new ValidationError(
      `Request size exceeds maximum allowed size of ${MAX_CONTENT_LENGTH} bytes`,
      'content-length'
    )
  }
}

export async function parseAssetUpload(
  request: Request
): Promise<MultipartEnvelope> {
  validateContentLength(request)

  let fields: FormData
  try {
    fields = await request.formData()
  } catch {
    throw new ValidationError('Failed to parse multipart form data', 'body')
  }

  const assetTarget = fields.get('assetTarget')
  if (typeof assetTarget !== 'string' || !assetTarget) {
    throw new ValidationError(
      'Missing or invalid assetTarget field',
      'assetTarget'
    )
  }

  const entityId = fields.get('entityId')
  if (typeof entityId !== 'string' || !entityId) {
    throw new ValidationError('Missing or invalid entityId field', 'entityId')
  }

  const blob = fields.get('blob')
  if (!blob || !(blob instanceof Blob)) {
    throw new ValidationError('Missing or invalid blob field', 'blob')
  }
  if (blob.type !== 'image/webp' && blob.type !== '') {
    throw new ValidationError('Blob must be WebP format', 'blob')
  }

  return { target: parseAssetTarget(assetTarget), entityId, blob, fields }
}
