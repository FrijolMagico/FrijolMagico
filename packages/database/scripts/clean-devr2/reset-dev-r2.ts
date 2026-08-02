/**
 * Resets the dev R2 bucket: deletes every object EXCEPT:
 * - the assets referenced by the seed, parsed from seed/seed.sql (the
 *   canonical seed definition — a live local.dev.db could reference dev-only
 *   uploads that are not part of the original seed and must not be preserved),
 *   when preserveSeedAssets is enabled; and
 * - any object under a folder listed in config's excludedFolders.
 *
 * Safety guards (fail-closed, in order):
 * 1. Must be invoked from packages/database (`bun run reset:dev-r2`).
 * 2. Development only, strictly: NODE_ENV exactly 'development' (provided
 *    explicitly by the package script) and VERCEL_ENV absent.
 * 3. R2_BUCKET_NAME must match config.devBucketName and R2_ACCOUNT_ID must be
 *    a valid https://<account>.r2.cloudflarestorage.com endpoint.
 * 4. There must be something to preserve (seed assets or excluded folders) —
 *    never clean "blind".
 * 5. Deletion requires an explicit "yes" answer on a TTY; non-TTY aborts.
 *
 * After deletion, preserved seed keys are verified with HEAD requests.
 */
import { existsSync, readFileSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  DeleteObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
  type ObjectIdentifier,
} from '@aws-sdk/client-s3'

import { devR2Config } from './config'
import {
  buildCleanupPlan,
  isDevEnvironment,
  parseSeedAssetKeys,
} from './reset-dev-r2-lib'

// Script lives at scripts/clean-devr2/, so the package root is two levels up.
const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const SEED_PATH = join(PACKAGE_ROOT, 'seed', 'seed.sql')
const S3_DELETE_HARD_LIMIT = 1000

interface R2Config {
  endpoint: string
  bucketName: string
  accessKeyId: string
  secretAccessKey: string
}

function fail(message: string): never {
  console.error(`\n  ✗ ${message}`)
  process.exit(1)
}

/** Guard 1: the script only runs from packages/database. */
function assertRunsFromDatabasePackage(): void {
  if (resolve(process.cwd()) !== PACKAGE_ROOT) {
    fail(
      'This script can only be run from packages/database: ' +
        'bun run reset:dev-r2',
    )
  }
}

/** Guard 2: development only, strictly (fail-closed). */
function assertDevEnvironment(): void {
  if (!isDevEnvironment(process.env)) {
    fail(
      'This script can only run in local development: NODE_ENV must be ' +
        'exactly "development" and VERCEL_ENV must be absent. Run it via ' +
        '`bun run reset:dev-r2`, which sets NODE_ENV=development.',
    )
  }
}

/** Guard 3: bucket must be the dev bucket; endpoint must look like R2. */
function assertDevBucketConfig(): R2Config {
  const endpoint = process.env.R2_ACCOUNT_ID
  const bucketName = process.env.R2_BUCKET_NAME
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!endpoint || !bucketName || !accessKeyId || !secretAccessKey) {
    fail(
      'Missing R2_* variables in packages/database/.env.local ' +
        '(R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY). ' +
        'Copy them from apps/admin/.env.local.',
    )
  }

  if (bucketName !== devR2Config.devBucketName) {
    fail(
      `R2_BUCKET_NAME="${bucketName}" is not the expected development bucket ` +
        `("${devR2Config.devBucketName}"). Operation aborted.`,
    )
  }

  let parsed: URL
  try {
    parsed = new URL(endpoint)
  } catch {
    fail('R2_ACCOUNT_ID is not a valid URL. Operation aborted.')
  }
  if (
    parsed.protocol !== 'https:' ||
    parsed.username !== '' ||
    parsed.password !== '' ||
    !parsed.hostname.endsWith('.r2.cloudflarestorage.com')
  ) {
    fail(
      'R2_ACCOUNT_ID does not look like a Cloudflare R2 endpoint ' +
        '(https://<account>.r2.cloudflarestorage.com). Operation aborted.',
    )
  }

  return { endpoint, bucketName, accessKeyId, secretAccessKey }
}

/**
 * Preserve source: the canonical seed definition. Parsing seed.sql (never
 * executing it) guarantees the preserve set only contains assets that belong
 * to the original seed — a live local.dev.db could be polluted with dev-only
 * uploads that should be cleaned up, not preserved.
 */
function readPreservedKeys(): string[] {
  if (!existsSync(SEED_PATH)) {
    fail(`Seed file not found at ${SEED_PATH}. There is no preserved-asset list.`)
  }
  return parseSeedAssetKeys(
    readFileSync(SEED_PATH, 'utf-8'),
    devR2Config.assetColumns,
  )
}

/**
 * Guard 5: deletion requires an explicit "yes" answer on a TTY.
 * No default: anything other than exactly "yes"/"no" re-prompts.
 */
async function confirmDeletion(
  bucketName: string,
  count: number,
): Promise<boolean> {
  if (!process.stdin.isTTY) {
    fail(
      'Interactive confirmation required: run this script in a terminal ' +
        '(stdin is not a TTY).',
    )
  }
  const readline = createInterface({ input: process.stdin, output: process.stdout })
  let answer: string
  do {
    answer = (
      await readline.question(
        `\n  Delete ${count} objects from bucket "${bucketName}"? [yes/no]: `,
      )
    )
      .trim()
      .toLowerCase()
    if (answer !== 'yes' && answer !== 'no') {
      console.log('  Please answer exactly "yes" or "no".')
    }
  } while (answer !== 'yes' && answer !== 'no')
  readline.close()
  return answer === 'yes'
}

async function main(): Promise<void> {
  console.log('\n  Dev R2 bucket reset\n')

  assertRunsFromDatabasePackage()
  assertDevEnvironment()
  const config = assertDevBucketConfig()

  // Guard 4: never clean "blind" — there must be something to preserve.
  const preserved = devR2Config.preserveSeedAssets ? readPreservedKeys() : []
  if (devR2Config.preserveSeedAssets && preserved.length === 0) {
    fail(
      'The set of assets to preserve is empty. ' +
        'The bucket is not cleaned without a preserved-asset list.',
    )
  }
  if (!devR2Config.preserveSeedAssets && devR2Config.excludedFolders.length === 0) {
    fail(
      'Nothing to preserve: preserveSeedAssets=false and excludedFolders is ' +
        'empty. Configure an exclusion or enable seed preservation.',
    )
  }

  console.log(`  ✓ Dev environment validated (bucket "${config.bucketName}")`)
  if (devR2Config.preserveSeedAssets) {
    console.log(
      `  ✓ ${preserved.length} assets preserved (source: seed/seed.sql)`,
    )
  } else {
    console.log(
      '  ⚠ preserveSeedAssets=false: seed assets are NOT protected.',
    )
  }
  if (devR2Config.excludedFolders.length > 0) {
    console.log('  Folders excluded by config:')
    for (const folder of devR2Config.excludedFolders) {
      const normalized = folder.trim()
      if (normalized) console.log(`    - ${normalized}`)
    }
  }

  const client = new S3Client({
    endpoint: config.endpoint,
    region: 'auto',
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  })

  // List every object (paginated).
  const keys: string[] = []
  let continuationToken: string | undefined
  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: config.bucketName,
        ContinuationToken: continuationToken,
      }),
    )
    for (const object of response.Contents ?? []) {
      if (object.Key) keys.push(object.Key)
    }
    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined
  } while (continuationToken !== undefined)
  keys.sort()

  // Partition bucket keys: preserved seed assets and excluded folders are
  // kept (including folder placeholders of protected paths); the rest is
  // deleted.
  const plan = buildCleanupPlan(keys, preserved, devR2Config.excludedFolders)

  console.log(`\n  Objects in bucket: ${keys.length}`)
  console.log(`  To preserve (seed): ${preserved.length}`)
  console.log(`  Excluded by config: ${plan.excludedKeys.length}`)
  console.log(`  To delete: ${plan.toDelete.length}`)

  // List EVERY object that will be deleted — assets and folder placeholders,
  // nothing shrunk. sampleSize omitted lists everything.
  if (plan.toDelete.length > 0) {
    const sampleSize = devR2Config.sampleSize
    const shown =
      sampleSize === undefined
        ? plan.toDelete
        : plan.toDelete.slice(0, Math.max(0, sampleSize))
    console.log('\n  Objects to delete:')
    for (const key of shown) {
      console.log(`    - ${key}`)
    }
    if (sampleSize !== undefined && plan.toDelete.length > sampleSize) {
      console.log(`    … and ${plan.toDelete.length - sampleSize} more`)
    }
  }

  if (plan.toDelete.length === 0) {
    console.log('\n  ✓ No objects to delete. Nothing to do.')
    client.destroy()
    return
  }

  // Guard: safety limit on how many objects a single run may delete.
  const totalToDelete = plan.toDelete.length
  if (
    devR2Config.maxObjectsToDelete !== null &&
    totalToDelete > devR2Config.maxObjectsToDelete
  ) {
    fail(
      `Deleting would remove ${totalToDelete} objects, exceeding the ` +
        `safety limit maxObjectsToDelete=${devR2Config.maxObjectsToDelete}. ` +
        'Operation aborted.',
    )
  }

  const confirmed = await confirmDeletion(config.bucketName, totalToDelete)
  if (!confirmed) {
    console.log('\n  ✗ Operation cancelled. No objects were deleted.')
    client.destroy()
    return
  }

  // Delete in batches (S3 hard limit: 1000 keys per request).
  const toDelete = plan.toDelete
  const batchSize = Math.min(devR2Config.deleteBatchSize, S3_DELETE_HARD_LIMIT)
  let deleted = 0
  const errors: string[] = []
  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = toDelete.slice(i, i + batchSize)
    const objects: ObjectIdentifier[] = batch.map((key) => ({ Key: key }))
    const response = await client.send(
      new DeleteObjectsCommand({
        Bucket: config.bucketName,
        Delete: { Objects: objects, Quiet: true },
      }),
    )
    deleted += batch.length - (response.Errors?.length ?? 0)
    for (const error of response.Errors ?? []) {
      errors.push(`${error.Key}: ${error.Message}`)
    }
  }

  // Verify the preserved seed assets still exist after the cleanup.
  let verified = 0
  const missing: string[] = []
  for (const key of preserved) {
    try {
      await client.send(
        new HeadObjectCommand({ Bucket: config.bucketName, Key: key }),
      )
      verified++
    } catch {
      missing.push(key)
    }
  }

  console.log(
    `\n  ✓ ${deleted} objects deleted` +
      (errors.length > 0 ? `, ${errors.length} with errors` : ''),
  )
  for (const error of errors.slice(0, 10)) {
    console.log(`    ✗ ${error}`)
  }
  if (devR2Config.preserveSeedAssets) {
    console.log(
      `  ✓ ${verified}/${preserved.length} preserved assets verified`,
    )
    if (missing.length > 0) {
      console.log(
        `  ⚠ ${missing.length} preserved assets not found ` +
          '(they may never have existed in the bucket):',
      )
      for (const key of missing.slice(0, 10)) {
        console.log(`    - ${key}`)
      }
    }
  }

  client.destroy()
}

main().catch((error) => {
  console.error(
    `\n  ✗ Reset failed: ${error instanceof Error ? error.message : String(error)}`,
  )
  process.exit(1)
})
