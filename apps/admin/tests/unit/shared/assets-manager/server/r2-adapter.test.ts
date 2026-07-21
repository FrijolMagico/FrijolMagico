import { describe, it, expect, mock } from 'bun:test'

mock.module('server-only', () => ({}))

const mockSend = mock(async () => ({}))
const mockPutObjectCommand = mock((args: unknown) => args)
const mockDeleteObjectCommand = mock((args: unknown) => args)

mock.module('@aws-sdk/client-s3', () => ({
  S3Client: mock(() => ({ send: mockSend })),
  PutObjectCommand: mockPutObjectCommand,
  DeleteObjectCommand: mockDeleteObjectCommand,
}))

const mockConfig = {
  endpoint: 'https://mock.r2.dev',
  bucketName: 'test-bucket',
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key',
}

describe('R2Adapter', () => {
  describe('uploadAsset', () => {
    it('returns ManagedAssetReference with path and version', async () => {
      const { R2Adapter } = await import('@/shared/assets-manager/server/r2-adapter')
      const adapter = new R2Adapter(mockConfig)
      const blob = new Blob(['fake-image'], { type: 'image/webp' })

      const result = await adapter.uploadAsset('artist-avatar', 'artist-123', blob, 'image/webp')

      expect(result.path).toContain('artist-avatar/artist-123/')
      expect(result.path).toMatch(/\.webp$/)
      expect(result.version).toBeTruthy()
      expect(mockSend).toHaveBeenCalled()
    })

    it('throws AssetStoreError when S3 send fails', async () => {
      const { R2Adapter } = await import('@/shared/assets-manager/server/r2-adapter')
      const { AssetStoreError } = await import('@/shared/assets-manager/server/asset-store-error')
      const adapter = new R2Adapter(mockConfig)
      const blob = new Blob(['fake-image'], { type: 'image/webp' })

      mockSend.mockRejectedValueOnce(new Error('S3 error'))

      await expect(
        adapter.uploadAsset('artist-avatar', 'artist-123', blob, 'image/webp'),
      ).rejects.toThrow(AssetStoreError)
    })
  })

  describe('deleteAsset', () => {
    it('succeeds silently when reference has no path', async () => {
      const { R2Adapter } = await import('@/shared/assets-manager/server/r2-adapter')
      const adapter = new R2Adapter(mockConfig)

      await expect(
        adapter.deleteAsset('artist-avatar', 'artist-123', { path: null, version: null }),
      ).resolves.toBeUndefined()
    })

    it('succeeds when path exists', async () => {
      const { R2Adapter } = await import('@/shared/assets-manager/server/r2-adapter')
      const adapter = new R2Adapter(mockConfig)

      await expect(
        adapter.deleteAsset('edition-poster', 'edition-456', { path: 'some/path.webp', version: 'v1' }),
      ).resolves.toBeUndefined()
    })

    it('throws AssetStoreError when delete fails', async () => {
      const { R2Adapter } = await import('@/shared/assets-manager/server/r2-adapter')
      const { AssetStoreError } = await import('@/shared/assets-manager/server/asset-store-error')
      const adapter = new R2Adapter(mockConfig)

      mockSend.mockRejectedValueOnce(new Error('Delete failed'))

      await expect(
        adapter.deleteAsset('edition-poster', 'edition-456', { path: 'some/path.webp', version: 'v1' }),
      ).rejects.toThrow(AssetStoreError)
    })
  })

  describe('replaceAsset', () => {
    it('uploads new asset and returns reference', async () => {
      const { R2Adapter } = await import('@/shared/assets-manager/server/r2-adapter')
      const adapter = new R2Adapter(mockConfig)
      const blob = new Blob(['new-image'], { type: 'image/webp' })

      const result = await adapter.replaceAsset(
        'edition-poster',
        'edition-789',
        { path: 'old/path.webp', version: 'v1' },
        blob,
        'image/webp',
      )

      expect(result.path).toContain('edition-poster/edition-789/')
      expect(result.version).toBeTruthy()
    })
  })
})
