import { describe, it, expect } from 'bun:test'
import { validatePreparedSize, assertValidAssetTarget } from '@/shared/assets-manager/server/validation'
import { ValidationError } from '@/shared/assets-manager/server/validation-error'

describe('validatePreparedSize', () => {
  describe('artist-avatar', () => {
    it('accepts 800×800', () => {
      expect(() => validatePreparedSize('artist-avatar', 800, 800)).not.toThrow()
    })

    it('rejects 800×600 (wrong height)', () => {
      expect(() => validatePreparedSize('artist-avatar', 800, 600)).toThrow(ValidationError)
    })

    it('rejects 600×800 (wrong width)', () => {
      expect(() => validatePreparedSize('artist-avatar', 600, 800)).toThrow(ValidationError)
    })
  })

  describe('edition-poster', () => {
    it('accepts 800×600 (any height)', () => {
      expect(() => validatePreparedSize('edition-poster', 800, 600)).not.toThrow()
    })

    it('accepts 800×1200 (any height)', () => {
      expect(() => validatePreparedSize('edition-poster', 800, 1200)).not.toThrow()
    })

    it('rejects 400×600 (wrong width)', () => {
      expect(() => validatePreparedSize('edition-poster', 400, 600)).toThrow(ValidationError)
    })
  })

  describe('edge cases', () => {
    it('rejects zero width', () => {
      expect(() => validatePreparedSize('artist-avatar', 0, 800)).toThrow(ValidationError)
    })

    it('rejects negative height', () => {
      expect(() => validatePreparedSize('edition-poster', 800, -1)).toThrow(ValidationError)
    })
  })
})

describe('assertValidAssetTarget', () => {
  it('returns "artist-avatar" for valid target', () => {
    expect(assertValidAssetTarget('artist-avatar')).toBe('artist-avatar')
  })

  it('returns "edition-poster" for valid target', () => {
    expect(assertValidAssetTarget('edition-poster')).toBe('edition-poster')
  })

  it('throws ValidationError for invalid target', () => {
    expect(() => assertValidAssetTarget('invalid-target')).toThrow(ValidationError)
  })

  it('throws ValidationError for empty string', () => {
    expect(() => assertValidAssetTarget('')).toThrow(ValidationError)
  })
})
