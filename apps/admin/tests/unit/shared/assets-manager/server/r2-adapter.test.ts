import { describe, expect, it, mock } from 'bun:test'

mock.module('server-only', () => ({}))

const mockSend = mock(async () => ({}))
const mockPutObjectCommand = mock((args: unknown) => args)
const mockDeleteObjectCommand = mock((args: unknown) => args)

mock.module('@aws-sdk/client-s3', () => ({
  S3Client: mock(() => ({ send: mockSend })),
  PutObjectCommand: mockPutObjectCommand,
  DeleteObjectCommand: mockDeleteObjectCommand
}))

const mockConfig = {
  endpoint: 'https://mock.r2.dev',
  bucketName: 'test-bucket',
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key'
}

describe('createR2Config', () => {
  it('uses the complete R2_ACCOUNT_ID value as the endpoint', async () => {
    const previous = { ...process.env }
    process.env.R2_ACCOUNT_ID = 'https://account-123.r2.cloudflarestorage.com'
    process.env.R2_BUCKET_NAME = 'test-bucket'
    process.env.R2_ACCESS_KEY_ID = 'test-access-key'
    process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key'

    try {
      const { createR2Config } = await import('@/shared/assets-manager/server/r2-adapter')
      expect(createR2Config().endpoint).toBe(
        'https://account-123.r2.cloudflarestorage.com'
      )
    } finally {
      process.env = previous
    }
  })
})

describe('R2Adapter', () => {
  it('puts a blob at the trusted key verbatim', async () => {
    const { R2Adapter } = await import('@/shared/assets-manager/server/r2-adapter')
    const adapter = new R2Adapter(mockConfig)
    const blob = new Blob(['fake-image'], { type: 'image/webp' })

    await adapter.putObject('artistas/nina/avatar-1720000000000.webp', blob)

    expect(mockPutObjectCommand).toHaveBeenLastCalledWith({
      Bucket: 'test-bucket',
      Key: 'artistas/nina/avatar-1720000000000.webp',
      Body: Buffer.from('fake-image'),
      ContentType: 'image/webp'
    })
  })

  it('preserves the upload failure cause', async () => {
    const { R2Adapter } = await import('@/shared/assets-manager/server/r2-adapter')
    const { AssetStoreError } = await import('@/shared/assets-manager/server/asset-store-error')
    const adapter = new R2Adapter(mockConfig)
    const cause = new Error('S3 error')
    mockSend.mockRejectedValueOnce(cause)

    await expect(
      adapter.putObject('artistas/nina/avatar-1720000000000.webp', new Blob())
    ).rejects.toMatchObject({ name: AssetStoreError.name, code: 'UPLOAD_FAILED', cause })
  })

  it('deletes only the supplied trusted key', async () => {
    const { R2Adapter } = await import('@/shared/assets-manager/server/r2-adapter')
    const adapter = new R2Adapter(mockConfig)

    await adapter.deleteObject('artistas/nina/avatar-1720000000000.webp')

    expect(mockDeleteObjectCommand).toHaveBeenLastCalledWith({
      Bucket: 'test-bucket',
      Key: 'artistas/nina/avatar-1720000000000.webp'
    })
  })

  it('preserves the delete failure cause', async () => {
    const { R2Adapter } = await import('@/shared/assets-manager/server/r2-adapter')
    const { AssetStoreError } = await import('@/shared/assets-manager/server/asset-store-error')
    const adapter = new R2Adapter(mockConfig)
    const cause = new Error('Delete failed')
    mockSend.mockRejectedValueOnce(cause)

    await expect(
      adapter.deleteObject('artistas/nina/avatar-1720000000000.webp')
    ).rejects.toMatchObject({ name: AssetStoreError.name, code: 'DELETE_FAILED', cause })
  })
})
