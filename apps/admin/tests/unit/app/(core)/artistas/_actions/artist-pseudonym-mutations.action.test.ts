import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { getTableName } from 'drizzle-orm'
import { artist as artistTables, participations } from '@frijolmagico/database/schema'
import {
  CANONICAL_CATALOG_SLUGS_CACHE_TAG,
  FEATURED_ARTISTS_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

const { artist, artistHistory, artistPseudonym, artistPrimaryPseudonym, artistSlugAlias, catalogArtist } = artistTables
const { participationActivity, participationExhibition } = participations

const updateTag = mock(() => {})
const revalidateWebCache = mock(async () => ({ revalidated: true }))
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
            where: () => {
              const count = state.selectCounts.get(table) ?? 0
              state.selectCounts.set(table, count + 1)
              const rows = state.selects.get(table)?.[count] ?? []
              return {
                limit: async () => rows,
                then: (resolve: (value: unknown[]) => unknown, reject: (reason: unknown) => unknown) =>
                  Promise.resolve(rows).then(resolve, reject)
              }
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
    delete: (target: unknown) => {
      const table = getTableName(target as Parameters<typeof getTableName>[0])
      return {
        where: async () => {
          state.writes.push({ operation: 'delete', table })
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
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCache }))

const { createArtistWithPseudonymsAction, mutateArtistPseudonymAction } = await import(
  '@/core/artistas/_actions/artist-pseudonym-mutations.action'
)
const { updateArtistaWithPseudonymsAction, updateArtistaAction } = await import(
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
  setSelects(mockDb, [[artist, [[{ id: 1, pseudonimo: 'Fallback' }]]]])
}

beforeEach(() => {
  updateTag.mockClear()
  revalidateWebCache.mockClear()
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

  test('renaming an inactive catalog-selected pseudonym changes the slug without canonical invalidation', async () => {
    const mockDb = createDatabaseMock()
    setSelects(mockDb, [
      [artist, [[{ id: 1, pseudonimo: 'Old Name' }], [{ slug: 'old-name' }], []]],
      [artistPrimaryPseudonym, [[{ pseudonimoId: 10 }]]],
      [artistPseudonym, [[pseudonym]]],
      [catalogArtist, [[{ pseudonimoId: 10, activo: false }], [{ pseudonimoId: 10, activo: false }]]],
      [artistSlugAlias, [[]]]
    ])
    currentDb = mockDb.db

    const result = await updateArtistaWithPseudonymsAction(
      { success: false, data: { id: 1 } } as never,
      {
        data: {
          nombre: 'Updated artist', pseudonimo: 'Renamed', rut: null,
          telefono: null, correo: null, ciudad: null, pais: null, rrss: null,
          estadoId: 1,
          historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false }
        },
        pseudonymDrafts: [{
          operation: 'edit', pseudonymId: 10, pseudonym: 'Renamed',
          preserveHistory: false, makePrimary: false
        }]
      } as never
    )

    expect(result.success).toBe(true)
    expect(mockDb.state.writes).toContainEqual(expect.objectContaining({
      operation: 'update', table: tableName(artist), value: { slug: 'renamed' }
    }))
    expect(mockDb.state.writes).toContainEqual(expect.objectContaining({
      operation: 'insert', table: tableName(artistSlugAlias),
      value: { slug: 'old-name', artistaId: 1 }
    }))
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas:base')
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas:base' })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas', path: '/catalogo' })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate', path: '/festivales/[slug]', pathType: 'page' })
  })

  test('renaming the catalog-selected pseudonym updates the slug and invalidates catalog caches', async () => {
    const mockDb = createDatabaseMock()
    setSelects(mockDb, [
      [artist, [[{ id: 1, pseudonimo: 'Old Name' }], [{ slug: 'old-name' }], []]],
      [artistPrimaryPseudonym, [[{ pseudonimoId: 10 }]]],
      [artistPseudonym, [[pseudonym]]],
      [catalogArtist, [[{ pseudonimoId: 10, activo: true, deletedAt: null }], [{ pseudonimoId: 10, activo: true, deletedAt: null }]]],
      [artistSlugAlias, [[]]]
    ])
    currentDb = mockDb.db

    const result = await updateArtistaWithPseudonymsAction(
      { success: false, data: { id: 1 } } as never,
      {
        data: {
          nombre: 'Updated artist', pseudonimo: 'Renamed', rut: null,
          telefono: null, correo: null, ciudad: null, pais: null, rrss: null,
          estadoId: 1,
          historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false }
        },
        pseudonymDrafts: [{
          operation: 'edit', pseudonymId: 10, pseudonym: 'Renamed',
          preserveHistory: false, makePrimary: false
        }]
      } as never
    )

    expect(result.success).toBe(true)
    expect(mockDb.state.writes).toContainEqual(expect.objectContaining({
      operation: 'update', table: tableName(artist), value: { slug: 'renamed' }
    }))
    expect(mockDb.state.writes).toContainEqual(expect.objectContaining({
      operation: 'insert', table: tableName(artistSlugAlias), value: { slug: 'old-name', artistaId: 1 }
    }))
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas:base')
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas:base' })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas', path: '/catalogo' })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FEATURED_ARTISTS_CACHE_TAG,
      mode: 'swr'
    })
  })

  test('renaming the catalog-selected pseudonym invalidates catalog when its slug stays the same', async () => {
    const mockDb = createDatabaseMock()
    withActiveArtist(mockDb)
    setSelects(mockDb, [
      [artistPseudonym, [[pseudonym]]],
      [artistPrimaryPseudonym, [[]]],
      [catalogArtist, [[{ pseudonimoId: 10 }], [{ pseudonimoId: 10 }]]],
      [artist, [[{ id: 1, pseudonimo: 'Fallback' }], [{ slug: 'old-name' }], []]],
      [artistSlugAlias, [[]]]
    ])
    currentDb = mockDb.db

    const result = await updateArtistaWithPseudonymsAction(
      { success: false, data: {
        id: 1, nombre: 'Artist', pseudonimo: 'Fallback', correo: null,
        rrss: null, ciudad: null, pais: null
      } } as never,
      {
        data: {
          nombre: 'Artist', pseudonimo: 'Fallback', rut: null,
          telefono: null, correo: null, ciudad: null, pais: null,
          rrss: null, estadoId: 1,
          historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false }
        },
        pseudonymDrafts: [{
          operation: 'edit', pseudonymId: 10, pseudonym: 'OLD NAME',
          preserveHistory: false, makePrimary: false
        }]
      } as never
    )

    expect(result.success).toBe(true)
    expect(mockDb.state.writes.some(({ value }) => (value as { slug?: string }).slug !== undefined)).toBe(false)
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas', path: '/catalogo' })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('renaming the primary invalidates catalog when the null selection displays its fallback', async () => {
    const mockDb = createDatabaseMock()
    withActiveArtist(mockDb)
    setSelects(mockDb, [
      [artistPseudonym, [[pseudonym]]],
      [artistPrimaryPseudonym, [[{ pseudonimoId: 10 }]]],
      [catalogArtist, [[{ pseudonimoId: null }], [{ pseudonimoId: null }]]]
    ])
    currentDb = mockDb.db

    const result = await updateArtistaWithPseudonymsAction(
      { success: false, data: { id: 1, pseudonimo: 'Old Name' } } as never,
      {
        data: {
          nombre: 'Artist', pseudonimo: 'Old Name', rut: null,
          telefono: null, correo: null, ciudad: null, pais: null,
          rrss: null, estadoId: 1,
          historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false }
        },
        pseudonymDrafts: [{
          operation: 'edit', pseudonymId: 10, pseudonym: 'Renamed primary',
          preserveHistory: false, makePrimary: false
        }]
      } as never
    )

    expect(result.success).toBe(true)
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas', path: '/catalogo' })
  })

  test('changing primary invalidates catalog when the null selection displays its new fallback', async () => {
    const mockDb = createDatabaseMock()
    withActiveArtist(mockDb)
    setSelects(mockDb, [
      [artistPseudonym, [[{ id: 20, pseudonimo: 'Secondary Name' }]]],
      [catalogArtist, [[{ pseudonimoId: null }]]]
    ])
    currentDb = mockDb.db

    const result = await updateArtistaWithPseudonymsAction(
      { success: false, data: {
        id: 1, nombre: 'Artist', pseudonimo: 'Fallback', correo: null,
        rrss: null, ciudad: null, pais: null
      } } as never,
      {
        data: {
          nombre: 'Artist', pseudonimo: 'Fallback', rut: null,
          telefono: null, correo: null, ciudad: null, pais: null,
          rrss: null, estadoId: 1,
          historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false }
        },
        pseudonymDrafts: [{
          operation: 'edit', pseudonymId: 20, pseudonym: 'Secondary Name',
          preserveHistory: false, makePrimary: true
        }]
      } as never
    )

    expect(result.success).toBe(true)
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas', path: '/catalogo' })
  })

  test('renaming a non-selected pseudonym does not invalidate catalog', async () => {
    const mockDb = createDatabaseMock()
    withActiveArtist(mockDb)
    setSelects(mockDb, [
      [artistPseudonym, [[pseudonym]]],
      [artistPrimaryPseudonym, [[]]],
      [catalogArtist, [[{ pseudonimoId: 99 }]]]
    ])
    currentDb = mockDb.db

    const result = await updateArtistaWithPseudonymsAction(
      { success: false, data: {
        id: 1, nombre: 'Artist', pseudonimo: 'Fallback', correo: null,
        rrss: null, ciudad: null, pais: null
      } } as never,
      {
        data: {
          nombre: 'Artist', pseudonimo: 'Fallback', rut: null,
          telefono: null, correo: null, ciudad: null, pais: null,
          rrss: null, estadoId: 1,
          historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false }
        },
        pseudonymDrafts: [{
          operation: 'edit', pseudonymId: 10, pseudonym: 'Renamed secondary',
          preserveHistory: false, makePrimary: false
        }]
      } as never
    )

    expect(result.success).toBe(true)
    expect(mockDb.state.writes.some(({ value }) =>
      (value as { slug?: string }).slug !== undefined
    )).toBe(false)
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FEATURED_ARTISTS_CACHE_TAG,
      mode: 'swr'
    })
    expect(updateTag).not.toHaveBeenCalledWith('catalogo:artistas')
  })

  test('updates with pseudonym drafts invalidate catalog when projected artist fields change', async () => {
    const mockDb = createDatabaseMock()
    withActiveArtist(mockDb)
    currentDb = mockDb.db

    const result = await updateArtistaWithPseudonymsAction(
      { success: false, data: {
        id: 1, nombre: 'Old Name', pseudonimo: 'Fallback', correo: null,
        rrss: null, ciudad: null, pais: null
      } } as never,
      {
        data: {
          nombre: 'New Name', pseudonimo: 'Fallback', rut: null,
          telefono: null, correo: null, ciudad: null, pais: null, rrss: null,
          estadoId: 1,
          historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false }
        },
        pseudonymDrafts: []
      } as never
    )

    expect(result.success).toBe(true)
    expect(mockDb.state.committed).toBe(true)
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas', path: '/catalogo' })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate', path: '/festivales/[slug]', pathType: 'page' })
  })

  test('active catalog projected artist and pseudonym changes invalidate festival detail data and route', async () => {
    const mockDb = createDatabaseMock()
    setSelects(mockDb, [
      [artist, [[{ id: 1, pseudonimo: 'Old Name' }], [{ slug: 'old-name' }], []]],
      [artistPrimaryPseudonym, [[{ pseudonimoId: 10 }]]],
      [artistPseudonym, [[pseudonym]]],
      [catalogArtist, [[{ pseudonimoId: 10, activo: true, deletedAt: null }], [{ pseudonimoId: 10, activo: true, deletedAt: null }]]],
      [artistSlugAlias, [[]]]
    ])
    currentDb = mockDb.db

    const result = await updateArtistaWithPseudonymsAction(
      { success: false, data: {
        id: 1, nombre: 'Old Name', pseudonimo: 'Old Name', correo: null,
        rrss: null, ciudad: null, pais: null
      } } as never,
      {
        data: {
          nombre: 'New Name', pseudonimo: 'Fallback', rut: null,
          telefono: null, correo: null, ciudad: null, pais: null, rrss: null,
          estadoId: 1,
          historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false }
        },
        pseudonymDrafts: [{
          operation: 'edit', pseudonymId: 10, pseudonym: 'Renamed',
          preserveHistory: false, makePrimary: false
        }]
      } as never
    )

    expect(result.success).toBe(true)
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate', path: '/festivales/[slug]', pathType: 'page'
    })
  })

  test('updates with pseudonym drafts do not invalidate catalog for unchanged projected fields', async () => {
    const mockDb = createDatabaseMock()
    setSelects(mockDb, [
      [artist, [[{ id: 1, pseudonimo: 'Fallback' }]]],
      [catalogArtist, [[{ pseudonimoId: null, activo: false }]]],
      [artistPrimaryPseudonym, [[]]]
    ])
    currentDb = mockDb.db

    const result = await updateArtistaWithPseudonymsAction(
      { success: false, data: {
        id: 1, nombre: 'Same Name', pseudonimo: 'Fallback', correo: null,
        rrss: null, ciudad: null, pais: null
      } } as never,
      {
        data: {
          nombre: 'Same Name', pseudonimo: 'Fallback', rut: null,
          telefono: null, correo: null, ciudad: null, pais: null, rrss: null,
          estadoId: 1,
          historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false }
        },
        pseudonymDrafts: []
      } as never
    )

    expect(result.success).toBe(true)
    expect(mockDb.state.committed).toBe(true)
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalledWith('catalogo:artistas')
  })

  test('legacy artist updates invalidate catalog when projected artist fields change without a slug change', async () => {
    const mockDb = createDatabaseMock()
    setSelects(mockDb, [
      [artist, [[{ slug: 'same-slug' }], []]],
      [catalogArtist, [[{ pseudonimoId: null }]]],
      [artistPrimaryPseudonym, [[]]]
    ])
    currentDb = mockDb.db

    const result = await updateArtistaAction(
      { success: false, data: { id: 1, nombre: 'Old Name', pseudonimo: 'Fallback' } } as never,
      {
        nombre: 'New Name', pseudonimo: 'Fallback', rut: null,
        telefono: null, correo: null, ciudad: null, pais: null, rrss: null,
        estadoId: 1,
        historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false }
      } as never
    )

    expect(result.success).toBe(true)
    expect(mockDb.state.writes.some(({ value }) => (value as { slug?: string }).slug !== undefined)).toBe(false)
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas', path: '/catalogo' })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate', path: '/festivales/[slug]', pathType: 'page' })
  })

  test('legacy active catalog projected artist changes invalidate festival detail data and route', async () => {
    const mockDb = createDatabaseMock()
    setSelects(mockDb, [
      [artist, [[{ slug: 'same-slug' }], []]],
      [catalogArtist, [[{ pseudonimoId: null, activo: true, deletedAt: null }]]],
      [artistPrimaryPseudonym, [[]]]
    ])
    currentDb = mockDb.db

    const result = await updateArtistaAction(
      { success: false, data: { id: 1, nombre: 'Old Name', pseudonimo: 'Fallback' } } as never,
      {
        nombre: 'New Name', pseudonimo: 'Fallback', rut: null,
        telefono: null, correo: null, ciudad: null, pais: null, rrss: null,
        estadoId: 1,
        historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false }
      } as never
    )

    expect(result.success).toBe(true)
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate', path: '/festivales/[slug]', pathType: 'page'
    })
  })

  test('legacy inactive artist updates do not invalidate detail for unchanged projected fields', async () => {
    const mockDb = createDatabaseMock()
    setSelects(mockDb, [
      [artist, [[{ slug: 'same-slug' }], []]],
      [catalogArtist, [[{ pseudonimoId: null, activo: false }]]],
      [artistPrimaryPseudonym, [[]]]
    ])
    currentDb = mockDb.db

    const result = await updateArtistaAction(
      { success: false, data: {
        id: 1, nombre: 'Same Name', pseudonimo: 'Fallback', correo: null,
        rrss: null, ciudad: null, pais: null
      } } as never,
      {
        nombre: 'Same Name', pseudonimo: 'Fallback', rut: null,
        telefono: null, correo: null, ciudad: null, pais: null, rrss: null,
        estadoId: 1,
        historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false }
      } as never
    )

    expect(result.success).toBe(true)
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalledWith('catalogo:artistas')
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
  })

})

describe('updateArtistaAction', () => {
  test('profile-only field changes invalidate catalog base without invalidating Featured', async () => {
    for (const [field, newValue] of [
      ['nombre', 'New Name'],
      ['correo', 'new@example.com'],
      ['ciudad', 'New City']
    ] as const) {
      const mockDb = createDatabaseMock()
      setSelects(mockDb, [
        [artist, [[{ slug: 'same-slug' }], []]],
        [catalogArtist, [[{ pseudonimoId: null }]]],
        [artistPrimaryPseudonym, [[]]]
      ])
      currentDb = mockDb.db

      const result = await updateArtistaAction(
        { success: false, data: {
          id: 1, nombre: 'Old Name', pseudonimo: 'Fallback', correo: 'old@example.com',
          rrss: null, ciudad: 'Old City', pais: null
        } } as never,
        {
          nombre: 'Old Name', pseudonimo: 'Fallback', rut: null,
          telefono: null, correo: 'old@example.com', ciudad: 'Old City', pais: null, rrss: null,
          estadoId: 1,
          historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false },
          [field]: newValue
        } as never
      )

      expect(result.success, field).toBe(true)
      expect(updateTag, field).toHaveBeenCalledWith('catalogo:artistas:base')
      expect(revalidateWebCache, field).toHaveBeenCalledWith({ tag: 'catalogo:artistas:base' })
      expect(revalidateWebCache, field).not.toHaveBeenCalledWith({
        tag: FEATURED_ARTISTS_CACHE_TAG,
        mode: 'swr'
      })
    }
  })

  test('legacy artist updates do not immediately invalidate canonical slugs for an inactive catalog row', async () => {
    const mockDb = createDatabaseMock()
    setSelects(mockDb, [
      [artist, [[{ slug: 'old-name' }], []]],
      [catalogArtist, [[{ pseudonimoId: 10, activo: false }]]],
      [artistPrimaryPseudonym, [[{ pseudonimoId: 10 }]]],
      [artistSlugAlias, [[]]]
    ])
    currentDb = mockDb.db

    const result = await updateArtistaAction(
      { success: false, data: { id: 1 } } as never,
      {
        nombre: 'Updated artist', pseudonimo: 'Renamed', rut: null,
        telefono: null, correo: null, ciudad: null, pais: null, rrss: null,
        estadoId: 1,
        historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false }
      } as never
    )

    expect(result.success).toBe(true)
    expect(mockDb.state.writes).toContainEqual(expect.objectContaining({
      operation: 'update', table: tableName(artist), value: { slug: 'renamed' }
    }))
    expect(mockDb.state.writes).toContainEqual(expect.objectContaining({
      operation: 'insert', table: tableName(artistSlugAlias),
      value: { slug: 'old-name', artistaId: 1 }
    }))
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas:base')
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas:base' })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas', path: '/catalogo' })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
  })

  test('legacy artist updates invalidate canonical slug caches when allocation changes an active catalog artist slug', async () => {
    const mockDb = createDatabaseMock()
    setSelects(mockDb, [
      [artist, [[{ slug: 'old-name' }], []]],
      [catalogArtist, [[{ pseudonimoId: 10, activo: true, deletedAt: null }]]],
      [artistPrimaryPseudonym, [[{ pseudonimoId: 10 }]]],
      [artistSlugAlias, [[]]]
    ])
    currentDb = mockDb.db

    const result = await updateArtistaAction(
      { success: false, data: { id: 1 } } as never,
      {
        nombre: 'Updated artist', pseudonimo: 'Renamed', rut: null,
        telefono: null, correo: null, ciudad: null, pais: null, rrss: null,
        estadoId: 1,
        historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false }
      } as never
    )

    expect(result.success).toBe(true)
    expect(mockDb.state.writes).toContainEqual(expect.objectContaining({
      operation: 'update', table: tableName(artist), value: { slug: 'renamed' }
    }))
    expect(mockDb.state.writes).toContainEqual(expect.objectContaining({
      operation: 'insert', table: tableName(artistSlugAlias),
      value: { slug: 'old-name', artistaId: 1 }
    }))
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FEATURED_ARTISTS_CACHE_TAG,
      mode: 'swr'
    })
  })
})

describe('updateArtistaWithPseudonymsAction', () => {
  test('legacy artist updates invalidate catalog when the selected primary pseudonym is renamed', async () => {
    const mockDb = createDatabaseMock()
    setSelects(mockDb, [
      [artist, [[{ slug: 'old-name' }], []]],
      [catalogArtist, [[{ pseudonimoId: 10 }]]],
      [artistPrimaryPseudonym, [[{ pseudonimoId: 10 }]]],
      [artistSlugAlias, [[]]]
    ])
    currentDb = mockDb.db

    const result = await updateArtistaAction(
      { success: false, data: { id: 1 } } as never,
      {
        nombre: 'Updated artist', pseudonimo: 'Renamed', rut: null,
        telefono: null, correo: null, ciudad: null, pais: null, rrss: null,
        estadoId: 1,
        historialFlags: { pseudonimo: false, correo: false, ciudad: false, pais: false, rrss: false }
      } as never
    )

    expect(result.success).toBe(true)
    expect(mockDb.state.writes).toContainEqual(expect.objectContaining({
      operation: 'update', table: tableName(artist), value: { slug: 'renamed' }
    }))
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas:base')
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas:base' })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas', path: '/catalogo' })
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
    expect(revalidateWebCache).not.toHaveBeenCalledWith({ tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate', path: '/festivales/[slug]', pathType: 'page' })
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
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate', path: '/festivales/[slug]', pathType: 'page'
    })
  })

  test('renames a non-selected pseudonym and invalidates festival detail', async () => {
    const mockDb = createDatabaseMock()
    withActiveArtist(mockDb)
    setSelects(mockDb, [
      [artistPseudonym, [[pseudonym]]],
      [artistPrimaryPseudonym, [[]]],
      [catalogArtist, [[{ pseudonimoId: 99 }]]]
    ])
    currentDb = mockDb.db

    const result = await mutateArtistPseudonymAction(null as never, {
      operation: 'rename', artistId: 1, pseudonymId: 10,
      pseudonym: 'Renamed', preserveHistory: false
    })

    expect(result.success).toBe(true)
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate', path: '/festivales/[slug]', pathType: 'page'
    })
  })

  test('add with makePrimary invalidates festival detail when compatibility text changes', async () => {
    const mockDb = createDatabaseMock()
    withActiveArtist(mockDb)
    setSelects(mockDb, [[catalogArtist, [[{ pseudonimoId: 10 }]]]])
    currentDb = mockDb.db

    const result = await mutateArtistPseudonymAction(null as never, {
      operation: 'add', artistId: 1, pseudonym: 'New Primary', makePrimary: true
    })

    expect(result.success).toBe(true)
    expect(mockDb.state.writes).toContainEqual(expect.objectContaining({
      operation: 'update', table: tableName(artist), value: { pseudonimo: 'New Primary' }
    }))
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate', path: '/festivales/[slug]', pathType: 'page'
    })
  })

  test('changes the slug for an inactive selected catalog pseudonym without canonical invalidation', async () => {
    const mockDb = createDatabaseMock()
    withActiveArtist(mockDb)
    setSelects(mockDb, [
      [artistPseudonym, [[{ id: 10, pseudonimo: 'Old Name' }]]],
      [artistPrimaryPseudonym, [[]]],
      [catalogArtist, [[{ pseudonimoId: 10, activo: false }]]],
      [artist, [[{ id: 1 }], [{ slug: 'old-name' }], [], []]],
      [artistSlugAlias, [[]]]
    ])
    currentDb = mockDb.db

    const result = await mutateArtistPseudonymAction(null as never, {
      operation: 'rename', artistId: 1, pseudonymId: 10,
      pseudonym: 'Renamed', preserveHistory: false
    })

    expect(result.success).toBe(true)
    expect(mockDb.state.writes).toContainEqual(expect.objectContaining({
      operation: 'update', table: tableName(artist), value: { slug: 'renamed' }
    }))
    expect(mockDb.state.writes).toContainEqual(expect.objectContaining({
      operation: 'insert', table: tableName(artistSlugAlias),
      value: { slug: 'old-name', artistaId: 1 }
    }))
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas:base')
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas:base' })
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas', path: '/catalogo' })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FEATURED_ARTISTS_CACHE_TAG,
      mode: 'swr'
    })
  })

  test('invalidates catalog for a selected pseudonym rename even when its slug is unchanged', async () => {
    const mockDb = createDatabaseMock()
    withActiveArtist(mockDb)
    setSelects(mockDb, [
      [artistPseudonym, [[{ id: 10, pseudonimo: 'Old Name' }]]],
      [artistPrimaryPseudonym, [[]]],
      [catalogArtist, [[{ pseudonimoId: 10 }]]],
      [artist, [[{ id: 1 }], [{ slug: 'old-name' }], [], []]],
      [artistSlugAlias, [[]]]
    ])
    currentDb = mockDb.db

    const result = await mutateArtistPseudonymAction(null as never, {
      operation: 'rename', artistId: 1, pseudonymId: 10,
      pseudonym: 'OLD NAME', preserveHistory: false
    })

    expect(result.success).toBe(true)
    expect(mockDb.state.writes.some(({ value }) => (value as { slug?: string }).slug !== undefined)).toBe(false)
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas', path: '/catalogo' })
  })

  test('does not invalidate catalog when a catalog-visible pseudonym rename rolls back', async () => {
    const mockDb = createDatabaseMock()
    withActiveArtist(mockDb)
    setSelects(mockDb, [
      [artistPseudonym, [[{ id: 10, pseudonimo: 'Old Name' }]]],
      [artistPrimaryPseudonym, [[{ pseudonimoId: 10 }]]]
    ])
    mockDb.state.failUpdateTable = tableName(artist)
    currentDb = mockDb.db

    const result = await mutateArtistPseudonymAction(null as never, {
      operation: 'rename', artistId: 1, pseudonymId: 10,
      pseudonym: 'New Name', preserveHistory: false
    })

    expect(result.success).toBe(false)
    expect(mockDb.state.rolledBack).toBe(true)
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalledWith('catalogo:artistas')
  })

  test('does not invalidate festival detail for a no-op pseudonym rename', async () => {
    const mockDb = createDatabaseMock()
    withActiveArtist(mockDb)
    setSelects(mockDb, [
      [artistPseudonym, [[{ id: 10, pseudonimo: 'Old Name' }]]],
      [artistPrimaryPseudonym, [[]]],
      [catalogArtist, [[{ pseudonimoId: 10 }]]],
      [artist, [[{ id: 1 }], [{ slug: 'old-name' }], [], []]],
      [artistSlugAlias, [[]]]
    ])
    currentDb = mockDb.db

    const result = await mutateArtistPseudonymAction(null as never, {
      operation: 'rename', artistId: 1, pseudonymId: 10,
      pseudonym: 'Old Name', preserveHistory: false
    })

    expect(result.success).toBe(true)
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalledWith('catalogo:artistas')
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate', path: '/festivales/[slug]', pathType: 'page'
    })
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
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate', path: '/festivales/[slug]', pathType: 'page'
    })
  })

  test('requires reassignment for referenced or primary names and moves references atomically', async () => {
    const referenced = createDatabaseMock()
    withActiveArtist(referenced)
    setSelects(referenced, [
      [artistPseudonym, [[pseudonym], [{ id: 11, pseudonimo: 'Replacement' }]]],
      [catalogArtist, [[{ id: 30 }], [{ id: 30, activo: true, deletedAt: null }]]],
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
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate', path: '/festivales/[slug]', pathType: 'page'
    })

    const retirement = createDatabaseMock()
    withActiveArtist(retirement)
    setSelects(retirement, [
      [artist, [[{ id: 1 }], [{ slug: 'old-name' }], []]],
      [artistPseudonym, [[pseudonym], [{ id: 11, pseudonimo: 'Replacement' }]]],
      [artistSlugAlias, [[]]],
      [catalogArtist, [[{ id: 30 }], [{ id: 30, activo: true, deletedAt: null }]]],
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
    expect(retirement.state.writes).toContainEqual(expect.objectContaining({
      operation: 'update', table: tableName(artist), value: { slug: 'replacement' }
    }))
    expect(retirement.state.writes).toContainEqual(expect.objectContaining({
      operation: 'insert', table: tableName(artistSlugAlias), value: { slug: 'old-name', artistaId: 1 }
    }))
    expect(revalidateWebCache).toHaveBeenCalledWith({ tag: 'catalogo:artistas', path: '/catalogo' })
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate', path: '/festivales/[slug]', pathType: 'page'
    })
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

  test('invalidates festival detail when retiring an active catalog-only pseudonym', async () => {
    const mockDb = createDatabaseMock()
    withActiveArtist(mockDb)
    setSelects(mockDb, [
      [artist, [[{ id: 1, slug: 'old-name' }], [{ id: 1, slug: 'old-name' }], []]],
      [artistPseudonym, [[pseudonym], [{ id: 11, pseudonimo: 'Replacement' }]]],
      [catalogArtist, [[{ id: 30, pseudonimoId: 10 }], [{ id: 30, activo: true, deletedAt: null }]]],
      [participationExhibition, [[]]],
      [participationActivity, [[]]],
      [artistPrimaryPseudonym, [[]]],
      [artistSlugAlias, [[]]]
    ])
    currentDb = mockDb.db

    const result = await mutateArtistPseudonymAction(null as never, {
      operation: 'retire', artistId: 1, pseudonymId: 10, reassignToPseudonymId: 11
    })

    expect(result.success).toBe(true)
    expect(mockDb.state.committed).toBe(true)
    expect(mockDb.state.writes).not.toContainEqual(expect.objectContaining({
      operation: 'update', table: tableName(artist), value: { pseudonimo: 'Replacement' }
    }))
    expect(updateTag).toHaveBeenCalledWith('catalogo:artistas')
    expect(revalidateWebCache).toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate', path: '/festivales/[slug]', pathType: 'page'
    })
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
    expect(revalidateWebCache).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalledWith('catalogo:artistas')
    expect(revalidateWebCache).not.toHaveBeenCalledWith({
      tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate', path: '/festivales/[slug]', pathType: 'page'
    })
  })
})
