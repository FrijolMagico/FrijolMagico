import 'server-only'

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import type { AssetStore } from './asset-store'

import { AssetStoreError } from './asset-store-error'

export interface R2Config {
  endpoint: string
  bucketName: string
  accessKeyId: string
  secretAccessKey: string
}

export function createR2Config(): R2Config {
  const endpoint = process.env.R2_ACCOUNT_ID
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

  async putObject(key: string, blob: Blob): Promise<void> {
    const buffer = Buffer.from(await blob.arrayBuffer())

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: blob.type,
        }),
      )
    } catch (cause) {
      throw new AssetStoreError(
        `Failed to upload asset: ${(cause as Error).message}`,
        'UPLOAD_FAILED',
        { cause },
      )
    }
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
            Key: key,
        }),
      )
    } catch (cause) {
      throw new AssetStoreError(
        `Failed to delete asset: ${(cause as Error).message}`,
        'DELETE_FAILED',
        { cause },
      )
    }
  }
}
