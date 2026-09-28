import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { getTableName } from 'drizzle-orm'
import { artist as artistTables, participations } from '@frijolmagico/database/schema'

const { artist, artistHistory, artistPseudonym, artistPrimaryPseudonym, catalogArtist } = artistTables
const { participationActivity, participationExhibition } = participations

const updateTag = mock(() => {})
const requireAuth = mock(async () => ({ user: { id: '1' } }))

type QueryState = {
  selects: Map<string, unknown[][]>
  selectCounts: Map<string, number>
  writes: { operation: string; table: string; value?: unknown }[]
  failUpdateTable?: string
  committed: boolean
  rolledBack: boolean
}

function createDatabaseMock() {
  const state: QueryState = {
    selects: new Map(),
    selectCounts: new Map(),
    writes: [],
    committed: false,
    rolledBack: false
  }

  const transaction = {
    select: () => {
      let table = ''
      return {
        from: (source: unknown) => {
          table = getTableName(source as Parameters<typeof getTableName>[0])
          return {
            where: async () => {
              const count = state.selectCounts.get(table) ?? 0
              state.selectCounts.set(table, count + 1)
              return state.selects.get(table)?.[count] ?? []
            }
          }
        }
      }
    },
    insert: (target: unknown) => {
      const table = getTableName(target as Parameters<typeof getTableName>[0])
      return {
        values: (value: unknown) => {
          state.writes.push({ operation: 'insert', table, value })
          return {
            returning: async () => table === getTableName(artist)
              ? [{ id: 1 }]
              : table === getTableName(artistPseudonym)
                ? [{ id: 20, pseudonimo: (value as { pseudonimo: string }).pseudonimo }]
                : [],
            onConflictDoUpdate: async () => undefined
          }
        }
      }
    },
    update: (target: unknown) => {
      const table = getTableName(target as Parameters<typeof getTableName>[0])
      return {
        set: (value: unknown) => ({
          where: async () => {
            state.writes.push({ operation: 'update', table, value })
            if (state.failUpdateTable === table) throw new Error('write failed')
          }
        })
      }
    }
  }

  return {
    state,
    db: {
      transaction: async (callback: (tx: typeof transaction) => Promise<unknown>) => {
        try {
          const result = await callback(transaction)
          state.committed = true
          return result
        } catch (error) {
          state.rolledBack = true
          throw error
        }
      }
    }
  }
}

let currentDb: ReturnType<typeof createDatabaseMock>['db']

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@frijolmagico/database/orm', () => ({
  db: new Proxy({}, { get: (_, property) => currentDb[property as keyof typeof currentDb] })
}))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))

const { createArtistWithPseudonymsAction, mutateArtistPseudonymAction } = await import(
  '@/core/artistas/_actions/artist-pseudonym-mutations.action'
)
const { updateArtistaWithPseudonymsAction } = await import(
  '@/core/artistas/_actions/update-artista.action'
)

const tableName = (table: unknown) => getTableName(table as Parameters<typeof getTableName>[0])
const pseudonym = { id: 10, pseudonimo: 'Old Name' }

function setSelects(
  mockDb: ReturnType<typeof createDatabaseMock>,
  entries: [unknown, unknown[][]][]
) {
  for (const [table, results] of entries) mockDb.state.selects.set(tableName(table), results)
}

function withActiveArtist(mockDb: ReturnType<typeof createDatabaseMock>) {
  setSelects(mockDb, [[artist, [[{ id: 1 }]]]])
}

beforeEach(() => {
  updateTag.mockClear()
  requireAuth.mockClear()
})

describe('createArtistWithPseudonymsAction', () => {
  test('lets the compatibility trigger create the primary and inserts only additional pseudonyms', async () => {
    const mockDb = createDatabaseMock()
    currentDb = mockDb.db

    const result = await createArtistWithPseudonymsAction(null as never, {
      artist: {
        estadoId: 1, nombre: null, slug: 'primary-name', rut: null, correo: null,
        rrss: null, ciudad: null, pais: null, telefono: null
      },
      pseudonyms: ['Primary Name', 'Additional Name'],
      primaryPseudonym: 'Primary Name'
    } as never)

    expect(result.success).toBe(true)
    expect(mockDb.state.writes).toEqual([
      {
        operation: 'insert',
        table: tableName(artist),
        value: expect.objectContaining({ pseudonimo: 'Primary Name', slug: 'primary-name' })
      },
      {
        operation: 'insert',
        table: tableName(artistPseudonym),
        value: [{ artistaId: 1, pseudonimo: 'Additional Name' }]
      }
    ])
    expect(mockDb.state.writes.some(({ table }) => table === tableName(artistPrimaryPseudonym))).toBe(false)
  })

  test('creates no extra pseudonym when the primary is the only pseudonym', async () => {
    const mockDb = createDatabaseMock()
    currentDb = mockDb.db

    const result = await createArtistWithPseudonymsAction(null as never, {
      artist: {
        estadoId: 1, nombre: null, slug: 'only-name', rut: null, correo: null,
        rrss: null, ciudad: null, pais: null, telefono: null
      },
      pseudonyms: ['Only Name'],
      primaryPseudonym: 'Only Name'
    } as never)

    expect(result.success).toBe(true)
    expect(mockDb.state.writes.map(({ table }) => table)).toEqual([tableName(artist)])
  })
})

describe('updateArtistaWithPseudonymsAction', () => {
  test('renames the implicit primary and updates general artist fields in one transaction', async () => {
    const mockDb = createDatabaseMock()
    withActiveArtist(mockDb)
    setSelects(mockDb, [
      [artistPrimaryPseudonym, [[{ pseudonimoId: 10 }], [{ pseudonimoId: 10 }]]],
      [artistPseudonym, [[pseudonym]]]
    ])
    currentDb = mockDb.db

    const result = await updateArtistaWithPseudonymsAction(
      { success: false, data: { id: 1 } } as never,
      {
        data: {
          nombre: 'Updated artist', pseudonimo: 'Renamed primary', rut: null,
          telefono: null, correo: null, ciudad: null, pais: null, rrss: null,
          estadoId: 1,
          historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false }
        },
        pseudonymDrafts: [{
          operation: 'edit', pseudonymId: null, pseudonym: 'Renamed primary',
          preserveHistory: false, makePrimary: false
        }]
      } as never
    )

    expect(result.success).toBe(true)
    expect(mockDb.state.committed).toBe(true)
    expect(mockDb.state.writes).toContainEqual(expect.objectContaining({
      operation: 'update', table: tableName(artistPseudonym),
      value: expect.objectContaining({ pseudonimo: 'Renamed primary' })
    }))
    expect(mockDb.state.writes).toContainEqual(expect.objectContaining({
      operation: 'update', table: tableName(artist),
      value: expect.objectContaining({ nombre: 'Updated artist' })
    }))
  })

  test('rolls back the whole submit when a general artist update fails', async () => {
    const mockDb = createDatabaseMock()
    withActiveArtist(mockDb)
    setSelects(mockDb, [
      [artistPrimaryPseudonym, [[{ pseudonimoId: 10 }]]],
      [artistPseudonym, [[{ id: 20, pseudonimo: 'Secondary Name' }]]]
    ])
    mockDb.state.failUpdateTable = tableName(artist)
    currentDb = mockDb.db

    const result = await updateArtistaWithPseudonymsAction(
      { success: false, data: { id: 1 } } as never,
      {
        data: {
          nombre: 'Updated artist', pseudonimo: 'Renamed primary', rut: null,
          telefono: null, correo: null, ciudad: null, pais: null, rrss: null,
          estadoId: 1,
          historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false }
        },
        pseudonymDrafts: [{
          operation: 'edit', pseudonymId: 20, pseudonym: 'Renamed secondary',
          preserveHistory: false, makePrimary: false
        }]
      } as never
    )

    expect(result.success).toBe(false)
    expect(mockDb.state.committed).toBe(false)
    expect(mockDb.state.rolledBack).toBe(true)
  })
})

describe('mutateArtistPseudonymAction', () => {
  test('rejects missing and soft-deleted artists before every mutation', async () => {
    for (const unavailableArtist of ['nonexistent', 'soft-deleted']) {
      const mockDb = createDatabaseMock()
      // Both states are absent from the active-artist query's result set.
      setSelects(mockDb, [[artist, [[]]]])
      currentDb = mockDb.db

      const result = await mutateArtistPseudonymAction(null as never, {
        operation: 'add', artistId: 1, pseudonym: 'New Name', makePrimary: false
      })

      expect(result.success, unavailableArtist).toBe(false)
      expect(result.errors?.[0].message).toContain('artista no existe o está eliminado')
      expect(mockDb.state.writes).toEqual([])
      expect(mockDb.state.committed).toBe(false)
      expect(mockDb.state.rolledBack).toBe(true)
    }
  })

  test('rejects nonexistent, foreign, or soft-deleted pseudonym identities', async () => {
    for (const unavailablePseudonym of ['nonexistent', 'foreign', 'soft-deleted']) {
      const mockDb = createDatabaseMock()
      withActiveArtist(mockDb)
      setSelects(mockDb, [[artistPseudonym, [[]]]])
      currentDb = mockDb.db

      const result = await mutateArtistPseudonymAction(null as never, {
        operation: 'set-primary', artistId: 1, pseudonymId: 10
      })

      expect(result.success, unavailablePseudonym).toBe(false)
      expect(mockDb.state.writes).toEqual([])
      expect(mockDb.state.rolledBack).toBe(true)
    }
  })

  test('adds a pseudonym without changing the primary unless requested', async () => {
    const mockDb = createDatabaseMock()
    withActiveArtist(mockDb)
    currentDb = mockDb.db

    const result = await mutateArtistPseudonymAction(null as never, {
      operation: 'add', artistId: 1, pseudonym: 'New Name', makePrimary: false
    })

    expect(result.success).toBe(true)
    expect(mockDb.state.writes).toEqual([
      { operation: 'insert', table: tableName(artistPseudonym), value: { artistaId: 1, pseudonimo: 'New Name' } }
    ])
    expect(mockDb.state.committed).toBe(true)
    expect(updateTag).toHaveBeenCalledTimes(1)
  })

  test('renames the selected identity and records old text only when requested', async () => {
    for (const preserveHistory of [false, true]) {
      const mockDb = createDatabaseMock()
      withActiveArtist(mockDb)
      setSelects(mockDb, [
        [artistPseudonym, [[pseudonym]]],
        [artistHistory, [[{ value: 2 }]]],
        [artistPrimaryPseudonym, [[{ pseudonimoId: 10 }]]]
      ])
      currentDb = mockDb.db

      const result = await mutateArtistPseudonymAction(null as never, {
        operation: 'rename', artistId: 1, pseudonymId: 10,
        pseudonym: 'Renamed', preserveHistory
      })

      expect(result.success).toBe(true)
      expect(mockDb.state.writes.some(({ table }) => table === tableName(artistPseudonym))).toBe(true)
      expect(mockDb.state.writes.some(({ table, value }) =>
        table === tableName(artistHistory) && (value as { pseudonimo?: string }).pseudonimo === 'Old Name'
      )).toBe(preserveHistory)
      expect(mockDb.state.writes.some(({ table, value }) =>
        table === tableName(artist) && (value as { pseudonimo?: string }).pseudonimo === 'Renamed'
      )).toBe(true)
    }
  })

  test('sets primary and updates the artist compatibility value', async () => {
    const mockDb = createDatabaseMock()
    withActiveArtist(mockDb)
    setSelects(mockDb, [[artistPseudonym, [[{ id: 11, pseudonimo: 'Second Name' }]]]])
    currentDb = mockDb.db

    const result = await mutateArtistPseudonymAction(null as never, {
      operation: 'set-primary', artistId: 1, pseudonymId: 11
    })

    expect(result.success).toBe(true)
    expect(mockDb.state.writes.some(({ table }) => table === tableName(artistPrimaryPseudonym))).toBe(true)
    expect(mockDb.state.writes.some(({ table, value }) =>
      table === tableName(artist) && (value as { pseudonimo?: string }).pseudonimo === 'Second Name'
    )).toBe(true)
  })

  test('requires reassignment for referenced or primary names and moves references atomically', async () => {
    const referenced = createDatabaseMock()
    withActiveArtist(referenced)
    setSelects(referenced, [
      [artistPseudonym, [[pseudonym], [{ id: 11, pseudonimo: 'Replacement' }]]],
      [catalogArtist, [[{ id: 30 }]]],
      [participationExhibition, [[]]],
      [participationActivity, [[]]],
      [artistPrimaryPseudonym, [[]]]
    ])
    currentDb = referenced.db

    const blocked = await mutateArtistPseudonymAction(null as never, {
      operation: 'retire', artistId: 1, pseudonymId: 10
    })
    expect(blocked.success).toBe(false)
    expect(referenced.state.writes).toEqual([])
    expect(referenced.state.rolledBack).toBe(true)

    const retirement = createDatabaseMock()
    withActiveArtist(retirement)
    setSelects(retirement, [
      [artistPseudonym, [[pseudonym], [{ id: 11, pseudonimo: 'Replacement' }]]],
      [catalogArtist, [[{ id: 30 }]]],
      [participationExhibition, [[{ id: 31 }]]],
      [participationActivity, [[{ id: 32 }]]],
      [artistPrimaryPseudonym, [[{ pseudonimoId: 10 }]]]
    ])
    currentDb = retirement.db

    const result = await mutateArtistPseudonymAction(null as never, {
      operation: 'retire', artistId: 1, pseudonymId: 10, reassignToPseudonymId: 11
    })
    expect(result.success).toBe(true)
    expect(retirement.state.committed).toBe(true)
    for (const table of [catalogArtist, participationExhibition, participationActivity]) {
      expect(retirement.state.writes.some(({ operation, table: writtenTable, value }) =>
        operation === 'update' && writtenTable === tableName(table) &&
        (value as { pseudonimoId?: number }).pseudonimoId === 11
      )).toBe(true)
    }
    expect(retirement.state.writes.some(({ table, value }) =>
      table === tableName(artistPseudonym) && (value as { deletedAt?: unknown }).deletedAt !== undefined
    )).toBe(true)
  })

  test('rolls back reassignment when a reference update fails', async () => {
    const mockDb = createDatabaseMock()
    withActiveArtist(mockDb)
    setSelects(mockDb, [
      [artistPseudonym, [[pseudonym], [{ id: 11, pseudonimo: 'Replacement' }]]],
      [catalogArtist, [[{ id: 30 }]]],
      [participationExhibition, [[]]],
      [participationActivity, [[]]],
      [artistPrimaryPseudonym, [[{ pseudonimoId: 10 }]]]
    ])
    mockDb.state.failUpdateTable = tableName(catalogArtist)
    currentDb = mockDb.db

    const result = await mutateArtistPseudonymAction(null as never, {
      operation: 'retire', artistId: 1, pseudonymId: 10, reassignToPseudonymId: 11
    })

    expect(result.success).toBe(false)
    expect(mockDb.state.committed).toBe(false)
    expect(mockDb.state.rolledBack).toBe(true)
    expect(mockDb.state.writes.some(({ table }) => table === tableName(artistPseudonym))).toBe(false)
  })
})
