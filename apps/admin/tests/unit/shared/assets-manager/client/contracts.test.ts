import { expect, test } from 'bun:test'

import * as lifecycleContracts from '../../../../../src/shared/assets-manager/client/contracts'

const FORBIDDEN_EXPORTS = [
  'ManagedAssetReference',
  'hasValidManagedAssetReference',
  'createEditionPosterKey'
] as const

function expectLifecycleContractSurface(
  contractSurface: Record<string, unknown>
) {
  expect(contractSurface.ASSET_TARGET).toEqual({
    ARTIST_AVATAR: 'artist-avatar',
    EDITION_POSTER: 'edition-poster'
  })

  for (const exportName of FORBIDDEN_EXPORTS) {
    expect(contractSurface).not.toHaveProperty(exportName)
  }
}

test('exports lifecycle contracts without neutral reference or edition-key APIs', () => {
  expectLifecycleContractSurface(lifecycleContracts)
})

test('rejects a deliberately boundary-violating lifecycle export surface', () => {
  expect(() =>
    expectLifecycleContractSurface({
      ...lifecycleContracts,
      createEditionPosterKey: () => 'afiche-12.webp'
    })
  ).toThrow()
})
