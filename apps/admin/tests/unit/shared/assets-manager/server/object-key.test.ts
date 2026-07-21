import { describe, it, expect } from 'bun:test'
import { deriveObjectKey } from '@/shared/assets-manager/server/object-key'

describe('deriveObjectKey', () => {
  it('derives artist-avatar key with target, entityId, and version', () => {
    const key = deriveObjectKey('artist-avatar', 'artist-123', 'v1abc')
    expect(key).toBe('artist-avatar/artist-123/v1abc.webp')
  })

  it('derives edition-poster key with target, entityId, and version', () => {
    const key = deriveObjectKey('edition-poster', 'edition-456', 'v2def')
    expect(key).toBe('edition-poster/edition-456/v2def.webp')
  })

  it('produces different keys for different entity IDs', () => {
    const key1 = deriveObjectKey('artist-avatar', 'entity-a', 'v1')
    const key2 = deriveObjectKey('artist-avatar', 'entity-b', 'v1')
    expect(key1).not.toBe(key2)
  })

  it('produces different keys for different versions', () => {
    const key1 = deriveObjectKey('artist-avatar', 'entity-1', 'v1')
    const key2 = deriveObjectKey('artist-avatar', 'entity-1', 'v2')
    expect(key1).not.toBe(key2)
  })

  it('handles special characters in entityId', () => {
    const key = deriveObjectKey('edition-poster', 'uuid-like-value', 'ver')
    expect(key).toBe('edition-poster/uuid-like-value/ver.webp')
  })
})
