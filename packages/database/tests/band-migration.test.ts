import { afterEach, describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createClient } from '@libsql/client'
import { eq, getTableColumns } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

import { band } from '../src/db/schema/artist'

const migrationsFolder = join(import.meta.dir, '../migrations')
const seedPath = join(import.meta.dir, '../seed/seed.sql')
const directories: string[] = []

async function freshDatabase() {
  const directory = await mkdtemp(join(tmpdir(), 'band-migration-'))
  directories.push(directory)
  const client = createClient({ url: `file:${join(directory, 'test.db')}` })
  await client.execute('PRAGMA foreign_keys = ON')
  const orm = drizzle(client)
  await migrate(orm, { migrationsFolder })
  return { client, orm }
}

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true }))
  )
})

describe('fresh local band migration contract', () => {
  test('journaled migrations create the Drizzle band columns and a physical band FK', async () => {
    const { client } = await freshDatabase()
    const columns = await client.execute('PRAGMA table_info(band)')
    const expectedColumns = Object.values(getTableColumns(band)).map(
      (column) => column.name
    )
    expect(columns.rows.map((row) => row.name)).toEqual(expectedColumns)
    expect(columns.rows.find((row) => row.name === 'name')?.notnull).toBe(1)
    expect(columns.rows.find((row) => row.name === 'active')?.dflt_value).toBe(
      '1'
    )
    const fk = await client.execute(
      'PRAGMA foreign_key_list(participacion_edicion)'
    )
    expect(fk.rows.find((row) => row.from === 'banda_id')?.table).toBe('band')
    const trigger = await client.execute(
      "SELECT tbl_name FROM sqlite_master WHERE name = 'trg_banda_updated_at'"
    )
    expect(trigger.rows[0]?.tbl_name).toBe('band')
  })

  test('complete seed runs after journaled migrations with valid band rows and foreign keys', async () => {
    const { client, orm } = await freshDatabase()
    const statements = readFileSync(seedPath, 'utf8')
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0)

    expect(statements.length).toBeGreaterThan(5)
    await client.execute('PRAGMA foreign_keys = OFF')
    for (const [index, statement] of statements.entries()) {
      try {
        await client.execute(statement)
      } catch (error) {
        throw new Error(
          `Complete seed failed at statement ${index + 1}/${statements.length}`,
          {
            cause: error
          }
        )
      }
    }
    await client.execute('PRAGMA foreign_keys = ON')

    const violations = await client.execute('PRAGMA foreign_key_check')
    expect(violations.rows).toEqual([])
    const bands = await orm.select().from(band).orderBy(band.id)
    expect(bands).toHaveLength(5)
    expect(bands[0]).toMatchObject({
      id: 1,
      name: 'Los Colores del Viento',
      active: true
    })
  })

  test('seed band inserts work with Drizzle and their participation references remain valid', async () => {
    const { client, orm } = await freshDatabase()
    const seed = readFileSync(seedPath, 'utf8')
    const inserts = seed.match(/^INSERT INTO (?:banda|band) \([^;]+;/gm) ?? []
    expect(inserts).toHaveLength(5)
    for (const statement of inserts) await client.execute(statement)
    const rows = await orm.select().from(band).where(eq(band.id, 1))
    expect(rows[0]).toMatchObject({
      name: 'Los Colores del Viento',
      active: true,
      phone: null,
      city: null,
      country: null,
      deletedAt: null
    })
    expect(rows[0]?.createdAt).toBeTruthy()
    const references =
      seed.match(
        /^INSERT INTO participacion_edicion \([^;]+\)\s*VALUES \((?:7|8|9|10|11),[^;]+;/gm
      ) ?? []
    expect(references).toHaveLength(5)
    await client.execute(
      "INSERT INTO organizacion (id, nombre) VALUES (1, 'Test')"
    )
    await client.execute(
      "INSERT INTO evento (id, organizacion_id, nombre, slug) VALUES (1, 1, 'Test', 'test')"
    )
    await client.execute(
      "INSERT INTO evento_edicion (id, evento_id, numero_edicion, slug) VALUES (1, 1, 'I', 'test-i'), (2, 1, 'II', 'test-ii')"
    )
    for (const statement of references) await client.execute(statement)
    const violations = await client.execute('PRAGMA foreign_key_check')
    expect(violations.rows).toEqual([])
    await expect(
      client.execute(
        'INSERT INTO participacion_edicion (edicion_id, banda_id) VALUES (1, 999)'
      )
    ).rejects.toThrow()
  })
})
