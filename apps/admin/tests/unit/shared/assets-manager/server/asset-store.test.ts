import { describe, it, expect, mock } from 'bun:test'

mock.module('server-only', () => ({}))

describe('assertAssetStore', () => {
  it('passes for a valid AssetStore implementation', async () => {
    const { assertAssetStore } = await import('@/shared/assets-manager/server/asset-store')

    const store = {
      uploadAsset: async () => ({ path: 'p', version: 'v' }),
      replaceAsset: async () => ({ path: 'p', version: 'v' }),
      deleteAsset: async () => {},
    }

    expect(() => assertAssetStore(store)).not.toThrow()
  })

  it('throws AssetStoreError for null', async () => {
    const { assertAssetStore } = await import('@/shared/assets-manager/server/asset-store')
    const { AssetStoreError } = await import('@/shared/assets-manager/server/asset-store-error')

    expect(() => assertAssetStore(null)).toThrow(AssetStoreError)
  })

  it('throws AssetStoreError for undefined', async () => {
    const { assertAssetStore } = await import('@/shared/assets-manager/server/asset-store')
    const { AssetStoreError } = await import('@/shared/assets-manager/server/asset-store-error')

    expect(() => assertAssetStore(undefined)).toThrow(AssetStoreError)
  })

  it('throws AssetStoreError for plain object without methods', async () => {
    const { assertAssetStore } = await import('@/shared/assets-manager/server/asset-store')
    const { AssetStoreError } = await import('@/shared/assets-manager/server/asset-store-error')

    expect(() => assertAssetStore({})).toThrow(AssetStoreError)
  })

  it('throws AssetStoreError for object missing deleteAsset', async () => {
    const { assertAssetStore } = await import('@/shared/assets-manager/server/asset-store')
    const { AssetStoreError } = await import('@/shared/assets-manager/server/asset-store-error')

    const invalid = {
      uploadAsset: async () => ({ path: 'p', version: 'v' }),
    }

    expect(() => assertAssetStore(invalid)).toThrow(AssetStoreError)
  })

  it('passes for minimal valid store', async () => {
    const { assertAssetStore } = await import('@/shared/assets-manager/server/asset-store')

    const minimal = {
      uploadAsset: async () => ({ path: '/test', version: '1' }),
      replaceAsset: async () => ({ path: '/test', version: '2' }),
      deleteAsset: async () => {},
    }

    expect(() => assertAssetStore(minimal)).not.toThrow()
  })
})
