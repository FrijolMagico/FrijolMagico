import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, test } from 'bun:test'
import { getTursoClient } from '../src/client'

describe('getTursoClient local file configuration', () => {
  const originalDatabaseUrl = process.env.TURSO_DATABASE_URL
  const originalAuthToken = process.env.TURSO_AUTH_TOKEN

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.TURSO_DATABASE_URL
    } else {
      process.env.TURSO_DATABASE_URL = originalDatabaseUrl
    }

    if (originalAuthToken === undefined) {
      delete process.env.TURSO_AUTH_TOKEN
    } else {
      process.env.TURSO_AUTH_TOKEN = originalAuthToken
    }
  })

  test('fails closed without a URL and opens a local file without networking', async () => {
    delete process.env.TURSO_DATABASE_URL
    delete process.env.TURSO_AUTH_TOKEN

    expect(() => getTursoClient()).toThrow(
      'Missing Turso database URL. Set TURSO_DATABASE_URL environment variable.'
    )

    process.env.TURSO_AUTH_TOKEN = 'unused-local-token'
    const directory = await mkdtemp(join(tmpdir(), 'local-file-client-'))
    const client = getTursoClient({
      url: pathToFileURL(join(directory, 'local.db')).href
    })

    try {
      const result = await client.execute('SELECT 1 AS value')
      expect(result.rows[0]?.value).toBe(1)
    } finally {
      try {
        await client.close()
      } finally {
        await rm(directory, { recursive: true, force: true })
      }
    }
  })
})
