import { describe, expect, test } from 'bun:test'

import {
  hasValidManagedAssetReference,
  type ManagedAssetReference
} from '../../../../src/shared/assets-manager/managed-asset-reference'

function validate(reference: ManagedAssetReference): boolean {
  return hasValidManagedAssetReference(reference)
}

describe('managed asset reference validation', () => {
  test('accepts absent references and legacy paths without versions', () => {
    expect(validate({ path: null, version: null })).toBe(true)
    expect(validate({ path: 'avatars/legacy.webp', version: null })).toBe(true)
  })

  test('accepts a managed path with a version', () => {
    expect(
      validate({ path: 'posters/afiche-12.webp', version: 'v1' })
    ).toBe(true)
  })

  test('rejects a version without a path', () => {
    expect(validate({ path: null, version: 'v1' })).toBe(false)
  })
})
