import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  mock,
  test
} from 'bun:test'
import { readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import {
  editionParticipation,
  participationActivity,
  participationExhibition
} from '../../../../../../../../packages/database/src/db/schema/participations'
import {
  participationActivityRelations,
  participationExhibitionRelations
} from '../../../../../../../../packages/database/src/db/relations'

const databaseDirectory = await mkdtemp(
  join(tmpdir(), 'participation-deletion-')
)
const databasePath = join(databaseDirectory, 'fixtures.db')
const client = createClient({ url: `file:${databasePath}` })
const database = drizzle(client, {
  schema: {
    editionParticipation,
    participationActivity,
    participationExhibition,
    participationActivityRelations,
    participationExhibitionRelations
  }
})
const updateTag = mock(() => {})
const getSession = mock(async () => ({ user: { id: '1' } }))
const requireAuth = mock(async () => ({ user: { id: '1' } }))
const getUser = mock(async () => ({ id: '1' }))

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@frijolmagico/database/orm', () => ({ db: database }))
mock.module('@/shared/lib/auth/utils', () => ({
  getSession,
  requireAuth,
  getUser
}))

const { deleteActivityAction } =
  await import('@/core/eventos/participaciones/_actions/activities/delete-activity.action')
const { deleteExhibitionAction } =
  await import('@/core/eventos/participaciones/_actions/exhibitions/delete-exhibition.action')
const { runParticipationDeletion } =
  await import('@/core/eventos/participaciones/_components/participations-container')

async function createSchema() {
  await client.batch([
    'PRAGMA foreign_keys = ON',
    'CREATE TABLE evento_edicion (id INTEGER PRIMARY KEY)',
    `CREATE TABLE participacion_edicion (
      id INTEGER PRIMARY KEY,
      edicion_id INTEGER NOT NULL REFERENCES evento_edicion(id),
      artista_id INTEGER,
      agrupacion_id INTEGER,
      banda_id INTEGER,
      notas TEXT,
      created_at TEXT,
      updated_at TEXT
    )`,
    `CREATE TABLE participacion_exposicion (
      id INTEGER PRIMARY KEY,
      participacion_id INTEGER NOT NULL UNIQUE REFERENCES participacion_edicion(id),
      disciplina_id INTEGER,
      postulacion_id INTEGER,
      modo_ingreso_id INTEGER,
      puntaje INTEGER,
      estado TEXT,
      notas TEXT,
      created_at TEXT,
      updated_at TEXT
    )`,
    `CREATE TABLE participacion_actividad (
      id INTEGER PRIMARY KEY,
      participacion_id INTEGER NOT NULL REFERENCES participacion_edicion(id),
      tipo_actividad_id INTEGER,
      postulacion_id INTEGER,
      modo_ingreso_id INTEGER,
      puntaje INTEGER,
      estado TEXT,
      notas TEXT,
      created_at TEXT,
      updated_at TEXT
    )`
  ])
}

async function resetFixtures() {
  await client.batch([
    'DROP TRIGGER IF EXISTS block_activity_deletion',
    'DELETE FROM participacion_actividad',
    'DELETE FROM participacion_exposicion',
    'DELETE FROM participacion_edicion',
    'DELETE FROM evento_edicion'
  ])
  updateTag.mockClear()
  requireAuth.mockClear()
}

async function seedParticipation(id = 1) {
  await client.batch([
    { sql: 'INSERT OR IGNORE INTO evento_edicion (id) VALUES (?)', args: [1] },
    {
      sql: 'INSERT INTO participacion_edicion (id, edicion_id) VALUES (?, ?)',
      args: [id, 1]
    }
  ])
}

async function idsOf(
  table: typeof participationActivity | typeof participationExhibition
) {
  return database.select({ id: table.id }).from(table).orderBy(table.id)
}

beforeAll(async () => {
  await createSchema()
})

beforeEach(async () => {
  await resetFixtures()
})

afterAll(async () => {
  client.close()
  await rm(databaseDirectory, { force: true, recursive: true })
})

describe('participation deletion persistence', () => {
  test('deleting an exhibition preserves its activities', async () => {
    await seedParticipation()
    await client.batch([
      {
        sql: 'INSERT INTO participacion_exposicion (id, participacion_id) VALUES (?, ?)',
        args: [10, 1]
      },
      {
        sql: 'INSERT INTO participacion_actividad (id, participacion_id) VALUES (?, ?)',
        args: [20, 1]
      }
    ])

    await expect(
      deleteExhibitionAction({ success: false }, { id: 10 })
    ).resolves.toEqual({
      success: true,
      data: { alreadyAbsent: false, participationDeleted: false }
    })

    expect(await idsOf(participationExhibition)).toEqual([])
    expect(await idsOf(participationActivity)).toEqual([{ id: 20 }])
    expect(await database.select().from(editionParticipation)).toHaveLength(1)
  })

  test('deleting an activity preserves its exhibition and sibling activities', async () => {
    await seedParticipation()
    await client.batch([
      {
        sql: 'INSERT INTO participacion_exposicion (id, participacion_id) VALUES (?, ?)',
        args: [10, 1]
      },
      {
        sql: 'INSERT INTO participacion_actividad (id, participacion_id) VALUES (?, ?)',
        args: [20, 1]
      },
      {
        sql: 'INSERT INTO participacion_actividad (id, participacion_id) VALUES (?, ?)',
        args: [21, 1]
      }
    ])

    await expect(deleteActivityAction({ id: 20 })).resolves.toEqual({
      success: true,
      data: { alreadyAbsent: false, participationDeleted: false }
    })

    expect(await idsOf(participationExhibition)).toEqual([{ id: 10 }])
    expect(await idsOf(participationActivity)).toEqual([{ id: 21 }])
  })

  test('deletes participacion_edicion only when no assignment remains', async () => {
    await seedParticipation()
    await client.execute({
      sql: 'INSERT INTO participacion_actividad (id, participacion_id) VALUES (?, ?)',
      args: [20, 1]
    })

    await expect(deleteActivityAction({ id: 20 })).resolves.toEqual({
      success: true,
      data: { alreadyAbsent: false, participationDeleted: true }
    })
    expect(await database.select().from(editionParticipation)).toEqual([])
  })

  test('makes a repeated deletion idempotent without removing a missing participation twice', async () => {
    await seedParticipation()
    await client.execute({
      sql: 'INSERT INTO participacion_actividad (id, participacion_id) VALUES (?, ?)',
      args: [20, 1]
    })

    await deleteActivityAction({ id: 20 })
    await seedParticipation(2)

    await expect(
      deleteActivityAction({
        id: 20,
        participacionId: 2,
        edicionId: 1
      } as { id: number })
    ).resolves.toEqual({
      success: true,
      data: { alreadyAbsent: true, participationDeleted: false }
    })
    expect(
      await database
        .select({ id: editionParticipation.id })
        .from(editionParticipation)
    ).toEqual([{ id: 2 }])
  })

  test('returns a real transactional error and rolls back the assignment deletion', async () => {
    await seedParticipation()
    await client.batch([
      {
        sql: 'INSERT INTO participacion_actividad (id, participacion_id) VALUES (?, ?)',
        args: [20, 1]
      },
      `CREATE TRIGGER block_activity_deletion
       BEFORE DELETE ON participacion_actividad
       BEGIN
         SELECT RAISE(ABORT, 'forced rollback');
       END`
    ])

    const result = await deleteActivityAction({ id: 20 })

    expect(result).toMatchObject({ success: false })
    expect(result.errors?.[0]?.message).toContain('delete from')
    expect(await idsOf(participationActivity)).toEqual([{ id: 20 }])
    expect(await database.select().from(editionParticipation)).toHaveLength(1)
  })
})

describe('participation deletion UI contracts', () => {
  test('runs success routing with pending cleanup, close, and refresh', async () => {
    const calls: string[] = []

    await expect(
      runParticipationDeletion({
        execute: async () => ({ success: true }),
        setPending: (isPending) => calls.push(`pending:${isPending}`),
        onSuccess: () => calls.push('success'),
        onError: () => calls.push('error'),
        close: () => calls.push('close'),
        refresh: () => calls.push('refresh')
      })
    ).resolves.toBe(true)

    expect(calls).toEqual([
      'pending:true',
      'success',
      'close',
      'refresh',
      'pending:false'
    ])
  })

  test('routes action failures without closing or refreshing', async () => {
    const calls: string[] = []

    await expect(
      runParticipationDeletion({
        execute: async () => ({
          success: false,
          errors: [{ message: 'Deletion failed' }]
        }),
        setPending: (isPending) => calls.push(`pending:${isPending}`),
        onSuccess: () => calls.push('success'),
        onError: (message) => calls.push(`error:${message}`),
        close: () => calls.push('close'),
        refresh: () => calls.push('refresh')
      })
    ).resolves.toBe(false)

    expect(calls).toEqual([
      'pending:true',
      'error:Deletion failed',
      'pending:false'
    ])
  })

  test('cleans pending state while surfacing unexpected action errors', async () => {
    const calls: string[] = []

    await expect(
      runParticipationDeletion({
        execute: async () => {
          throw new Error('network unavailable')
        },
        setPending: (isPending) => calls.push(`pending:${isPending}`),
        onSuccess: () => calls.push('success'),
        onError: (message) => calls.push(`error:${message}`),
        close: () => calls.push('close'),
        refresh: () => calls.push('refresh')
      })
    ).resolves.toBe(false)

    expect(calls).toEqual([
      'pending:true',
      'error:network unavailable',
      'pending:false'
    ])
  })

  test('keeps the destructive footer action before the close and save controls', () => {
    const entityFormDialog = readFileSync(
      join(
        import.meta.dir,
        '../../../../../../src/shared/components/entity-form/entity-form-dialog.tsx'
      ),
      'utf8'
    )

    expect(entityFormDialog).toMatch(
      /\{footerStart && \([\s\S]*?\{footerStart\}[\s\S]*?<div className='flex flex-wrap justify-end gap-2 sm:ml-auto'>/
    )
  })
})
