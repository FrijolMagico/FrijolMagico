import 'server-only'

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'node:crypto'

import type { AssetTarget } from '../client/contracts'
import type { ManagedAssetReference } from '../managed-asset-reference'
import type { AssetStore } from './asset-store'

import { AssetStoreError } from './asset-store-error'
import { deriveObjectKey } from './object-key'

export interface R2Config {
  endpoint: string
  bucketName: string
  accessKeyId: string
  secretAccessKey: string
}

export function createR2Config(): R2Config {
  const endpoint = process.env.R2_ENDPOINT
  const bucketName = process.env.R2_BUCKET_NAME
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!endpoint || !bucketName || !accessKeyId || !secretAccessKey) {
    throw new AssetStoreError(
      'Missing R2 configuration in environment variables',
      'MISSING_CONFIG',
    )
  }

  return { endpoint, bucketName, accessKeyId, secretAccessKey }
}

export class R2Adapter implements AssetStore {
  private readonly client: S3Client
  private readonly bucketName: string

  constructor(config: R2Config) {
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: 'auto',
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    })
    this.bucketName = config.bucketName
  }

  async uploadAsset(
    target: AssetTarget,
    entityId: string,
    blob: Blob,
    _mimeType: string,
  ): Promise<ManagedAssetReference> {
    const version = crypto.randomUUID()
    const key = deriveObjectKey(target, entityId, version)

    const buffer = Buffer.from(await blob.arrayBuffer())

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: 'image/webp',
        }),
      )

      return { path: key, version }
    } catch (cause) {
      throw new AssetStoreError(
        `Failed to upload asset: ${(cause as Error).message}`,
        'UPLOAD_FAILED',
      )
    }
  }

  async replaceAsset(
    target: AssetTarget,
    entityId: string,
    currentRef: ManagedAssetReference,
    blob: Blob,
    mimeType: string,
  ): Promise<ManagedAssetReference> {
    const ref = await this.uploadAsset(target, entityId, blob, mimeType)

    if (currentRef.path) {
      try {
        await this.client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: currentRef.path,
          }),
        )
      } catch {
        // Old object deletion is best-effort; new upload succeeded
      }
    }

    return ref
  }

  async deleteAsset(
    _target: AssetTarget,
    _entityId: string,
    ref: ManagedAssetReference,
  ): Promise<void> {
    if (!ref.path) {
      return
    }

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: ref.path,
        }),
      )
    } catch (cause) {
      throw new AssetStoreError(
        `Failed to delete asset: ${(cause as Error).message}`,
        'DELETE_FAILED',
      )
    }
  }
}
