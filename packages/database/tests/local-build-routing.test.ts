import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, test } from 'bun:test'
import { getBuildEnvironment } from '../../../scripts/build-local'

const directories: string[] = []

async function createBuildRoot(files: string[]) {
  const root = await mkdtemp(join(tmpdir(), 'local-build-routing-'))
  directories.push(root)
  const databaseDirectory = join(root, 'packages', 'database')
  await mkdir(databaseDirectory, { recursive: true })
  for (const file of files) {
    await writeFile(join(databaseDirectory, file), 'synthetic database fixture')
  }
  return root
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true })
  ))
})

describe('local build database routing', () => {
  test('routes the default build to the existing staging snapshot', async () => {
    const root = await createBuildRoot(['local.dev.db'])
    const env = await getBuildEnvironment('staging', root, { NODE_ENV: 'development', TURSO_AUTH_TOKEN: 'ambient' })

    expect(env.TURSO_DATABASE_URL).toBe(pathToFileURL(join(root, 'packages/database/local.dev.db')).href)
    expect(env.TURSO_AUTH_TOKEN).toBe('')
    expect(env.DATA_SOURCE).toBe('local')
  })

  test('routes the production build alias to the existing production snapshot', async () => {
    const root = await createBuildRoot(['local.db'])
    const env = await getBuildEnvironment('production', root, { NODE_ENV: 'development' })

    expect(env.TURSO_DATABASE_URL).toBe(pathToFileURL(join(root, 'packages/database/local.db')).href)
    expect(env.TURSO_AUTH_TOKEN).toBe('')
    expect(env.DATA_SOURCE).toBe('local')
  })

  test('fails without creating a missing selected snapshot', async () => {
    const root = await createBuildRoot([])

    await expect(getBuildEnvironment('staging', root, { NODE_ENV: 'development' })).rejects.toThrow(
      'Required staging database snapshot is missing'
    )
  })

  test('leaves configured database routing unchanged on Vercel', async () => {
    const root = await createBuildRoot([])
    const configured: NodeJS.ProcessEnv = {
      NODE_ENV: 'development',
      TURSO_DATABASE_URL: 'https://configured.example.invalid',
      TURSO_AUTH_TOKEN: 'configured-token',
      DATA_SOURCE: 'real',
      VERCEL: '1'
    }

    const environment = await getBuildEnvironment('staging', root, configured)
    expect(environment).toEqual(configured)
  })
})
