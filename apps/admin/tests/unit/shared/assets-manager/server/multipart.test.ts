import { describe, it, expect, mock } from 'bun:test'
import { parseAssetUpload } from '@/shared/assets-manager/server/multipart'
import { ValidationError } from '@/shared/assets-manager/server/validation-error'

function createMockRequest(overrides: {
  contentLength?: string
  fields?: Record<string, string | Blob>
}): Request {
  const headers: Record<string, string> = {}

  if (overrides.contentLength) {
    headers['content-length'] = overrides.contentLength
  }

  const fields = overrides.fields ?? {}

  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value)
  }

  return {
    headers: new Headers(headers),
    formData: mock(async () => formData),
  } as unknown as Request
}

describe('parseAssetUpload', () => {
  it('parses valid artist-avatar upload', async () => {
    const request = createMockRequest({
      contentLength: '500000',
      fields: {
        assetTarget: 'artist-avatar',
        entityId: 'artist-123',
        blob: new Blob(['fake-webp'], { type: 'image/webp' }),
        preparedWidth: '800',
        preparedHeight: '800',
      },
    })

    const result = await parseAssetUpload(request)

    expect(result.target).toBe('artist-avatar')
    expect(result.entityId).toBe('artist-123')
    expect(result.mimeType).toBe('image/webp')
    expect(result.preparedWidth).toBe(800)
    expect(result.preparedHeight).toBe(800)
  })

  it('parses valid edition-poster upload', async () => {
    const request = createMockRequest({
      contentLength: '300000',
      fields: {
        assetTarget: 'edition-poster',
        entityId: 'edition-456',
        blob: new Blob(['fake-webp'], { type: 'image/webp' }),
        preparedWidth: '800',
        preparedHeight: '600',
      },
    })

    const result = await parseAssetUpload(request)

    expect(result.target).toBe('edition-poster')
    expect(result.entityId).toBe('edition-456')
    expect(result.preparedWidth).toBe(800)
    expect(result.preparedHeight).toBe(600)
  })

  it('rejects payload exceeding content-length limit', async () => {
    const request = createMockRequest({
      contentLength: String(2 * 1024 * 1024), // 2 MiB > 1.25 MiB
    })

    expect(parseAssetUpload(request)).rejects.toThrow(ValidationError)
  })

  it('rejects invalid assetTarget', async () => {
    const request = createMockRequest({
      fields: {
        assetTarget: 'invalid-target',
        entityId: 'x',
        blob: new Blob(['test'], { type: 'image/webp' }),
        preparedWidth: '800',
        preparedHeight: '800',
      },
    })

    expect(parseAssetUpload(request)).rejects.toThrow(ValidationError)
  })

  it('rejects missing entityId', async () => {
    const request = createMockRequest({
      fields: {
        assetTarget: 'artist-avatar',
        blob: new Blob(['test'], { type: 'image/webp' }),
        preparedWidth: '800',
        preparedHeight: '800',
      },
    })

    expect(parseAssetUpload(request)).rejects.toThrow(ValidationError)
  })

  it('rejects missing blob', async () => {
    const request = createMockRequest({
      fields: {
        assetTarget: 'artist-avatar',
        entityId: 'x',
        preparedWidth: '800',
        preparedHeight: '800',
      },
    })

    expect(parseAssetUpload(request)).rejects.toThrow(ValidationError)
  })

  it('rejects non-positive preparedWidth', async () => {
    const request = createMockRequest({
      fields: {
        assetTarget: 'artist-avatar',
        entityId: 'x',
        blob: new Blob(['test'], { type: 'image/webp' }),
        preparedWidth: '0',
        preparedHeight: '800',
      },
    })

    expect(parseAssetUpload(request)).rejects.toThrow(ValidationError)
  })
})
