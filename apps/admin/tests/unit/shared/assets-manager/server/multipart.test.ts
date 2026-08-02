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
    formData: mock(async () => formData)
  } as unknown as Request
}

describe('parseAssetUpload', () => {
  it('parses a neutral artist-avatar envelope and leaves legacy fields opaque', async () => {
    const request = createMockRequest({
      contentLength: '500000',
      fields: {
        assetTarget: 'artist-avatar',
        entityId: 'artist-123',
        slug: 'artista-de-prueba',
        blob: new Blob(['fake-webp'], { type: 'image/webp' }),
        preparedWidth: '800',
        preparedHeight: '800'
      }
    })

    const result = await parseAssetUpload(request)

    expect(result.target).toBe('artist-avatar')
    expect(result.entityId).toBe('artist-123')
    expect(result.blob).toBeInstanceOf(Blob)
    expect(result.fields.get('slug')).toBe('artista-de-prueba')
    expect('slug' in result).toBe(false)
    expect('preparedWidth' in result).toBe(false)
  })

  it('preserves an explicit expected-none guard as an opaque field', async () => {
    const request = createMockRequest({
      fields: {
        assetTarget: 'artist-avatar',
        entityId: 'artist-123',
        blob: new Blob(['fake-webp'], { type: 'image/webp' }),
        preparedWidth: '800',
        preparedHeight: '800',
        expectedActiveNone: 'true'
      }
    })

    const result = await parseAssetUpload(request)

    expect(result.fields.get('expectedActiveNone')).toBe('true')
  })

  it('parses a neutral edition-poster envelope', async () => {
    const request = createMockRequest({
      contentLength: '300000',
      fields: {
        assetTarget: 'edition-poster',
        entityId: 'edition-456',
        blob: new Blob(['fake-webp'], { type: 'image/webp' }),
        preparedWidth: '800',
        preparedHeight: '600'
      }
    })

    const result = await parseAssetUpload(request)

    expect(result.target).toBe('edition-poster')
    expect(result.entityId).toBe('edition-456')
    expect(result.fields.get('preparedWidth')).toBe('800')
    expect(result.fields.get('preparedHeight')).toBe('600')
  })

  it('preserves a complete replacement reference as opaque fields', async () => {
    const request = createMockRequest({
      fields: {
        assetTarget: 'artist-avatar',
        entityId: 'artist-123',
        blob: new Blob(['fake-webp'], { type: 'image/webp' }),
        preparedWidth: '800',
        preparedHeight: '800',
        currentPath: 'artist-avatar/artist-123/current.webp',
        currentVersion: 'current-version'
      }
    })

    const result = await parseAssetUpload(request)

    expect(result.fields.get('currentPath')).toBe(
      'artist-avatar/artist-123/current.webp'
    )
    expect(result.fields.get('currentVersion')).toBe('current-version')
  })

  it('does not interpret a missing replacement reference', async () => {
    const request = createMockRequest({
      fields: {
        assetTarget: 'artist-avatar',
        entityId: 'artist-123',
        blob: new Blob(['fake-webp'], { type: 'image/webp' }),
        preparedWidth: '800',
        preparedHeight: '800'
      }
    })

    const result = await parseAssetUpload(request)

    expect(result.fields.get('currentPath')).toBeNull()
  })

  it('does not interpret a partial replacement reference', async () => {
    const request = createMockRequest({
      fields: {
        assetTarget: 'artist-avatar',
        entityId: 'artist-123',
        blob: new Blob(['fake-webp'], { type: 'image/webp' }),
        preparedWidth: '800',
        preparedHeight: '800',
        currentVersion: 'current-version'
      }
    })

    const result = await parseAssetUpload(request)

    expect(result.fields.get('currentVersion')).toBe('current-version')
  })

  it('rejects payload exceeding content-length limit', async () => {
    const request = createMockRequest({
      contentLength: String(2 * 1024 * 1024) // 2 MiB > 1.25 MiB
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
        preparedHeight: '800'
      }
    })

    expect(parseAssetUpload(request)).rejects.toThrow(ValidationError)
  })

  it('rejects missing entityId', async () => {
    const request = createMockRequest({
      fields: {
        assetTarget: 'artist-avatar',
        blob: new Blob(['test'], { type: 'image/webp' }),
        preparedWidth: '800',
        preparedHeight: '800'
      }
    })

    expect(parseAssetUpload(request)).rejects.toThrow(ValidationError)
  })

  it('rejects missing blob', async () => {
    const request = createMockRequest({
      fields: {
        assetTarget: 'artist-avatar',
        entityId: 'x',
        preparedWidth: '800',
        preparedHeight: '800'
      }
    })

    expect(parseAssetUpload(request)).rejects.toThrow(ValidationError)
  })

  it('keeps an invalid prepared width opaque for the feature parser', async () => {
    const request = createMockRequest({
      fields: {
        assetTarget: 'artist-avatar',
        entityId: 'x',
        blob: new Blob(['test'], { type: 'image/webp' }),
        preparedWidth: '0',
        preparedHeight: '800'
      }
    })

    const result = await parseAssetUpload(request)

    expect(result.fields.get('preparedWidth')).toBe('0')
  })
})
