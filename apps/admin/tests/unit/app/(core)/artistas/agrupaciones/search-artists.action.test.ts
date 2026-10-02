import { beforeEach, describe, expect, mock, test } from 'bun:test'

const calls: Array<{ whereArgs: unknown[] }> = []
let results: unknown[][] = []

const dbMock = {
  select: () => {
    const call = { whereArgs: [] as unknown[] }
    calls.push(call)
    const builder = {
      from: () => builder,
      leftJoin: () => builder,
      where: (...args: unknown[]) => {
        call.whereArgs.push(...args)
        return builder
      },
      orderBy: () => builder,
      limit: () => builder,
      then: (
        resolve: (value: unknown[]) => unknown,
        reject?: (reason: unknown) => unknown
      ) => {
        const result = results.shift()
        if (!result) {
          throw new Error('No mocked result available for db.select')
        }
        return Promise.resolve(result).then(resolve, reject)
      }
    }
    return builder
  }
}

mock.module('server-only', () => ({}))
mock.module('@frijolmagico/database/orm', () => ({ db: dbMock }))

const { searchArtistsAction } = await import(
  '@/core/artistas/agrupaciones/_actions/search-artists.action'
)

function flattenPrimitiveValues(value: unknown): Array<string | number> {
  if (Array.isArray(value)) return value.flatMap(flattenPrimitiveValues)
  if (typeof value === 'string' || typeof value === 'number') return [value]
  if (!value || typeof value !== 'object') return []
  if ('value' in value) {
    return flattenPrimitiveValues((value as { value: unknown }).value)
  }
  if ('queryChunks' in value) {
    return flattenPrimitiveValues(
      (value as { queryChunks: unknown[] }).queryChunks
    )
  }
  if ('table' in value) return []
  return Object.values(value).flatMap(flattenPrimitiveValues)
}

beforeEach(() => {
  calls.length = 0
  results = []
})

describe('searchArtistsAction', () => {
  test('finds artists by active alias and returns the current alias plus matching label', async () => {
    results = [
      [
        {
          id: 1,
          pseudonym: 'Current name',
          legacyPseudonym: 'Legacy name',
          city: 'Valparaíso'
        }
      ],
      [
        { artistId: 1, pseudonym: 'Alias matching' },
        { artistId: 1, pseudonym: 'Another matching alias' }
      ]
    ]

    await expect(searchArtistsAction('matching')).resolves.toEqual([
      {
        id: 1,
        pseudonym: 'Current name',
        aliasLabel: 'Alias matching, Another matching alias',
        city: 'Valparaíso'
      }
    ])
    expect(calls).toHaveLength(3)
    expect(flattenPrimitiveValues(calls[1]?.whereArgs)).toContain('%matching%')
    expect(flattenPrimitiveValues(calls[2]?.whereArgs)).toEqual(
      expect.arrayContaining([1, '%matching%'])
    )
  })

  test('finds artists by name without requiring an alias match', async () => {
    results = [
      [
        {
          id: 2,
          pseudonym: null,
          legacyPseudonym: 'Legacy alias',
          city: null
        }
      ],
      []
    ]

    await expect(searchArtistsAction('Artist name')).resolves.toEqual([
      {
        id: 2,
        pseudonym: 'Legacy alias',
        aliasLabel: null,
        city: null
      }
    ])
  })

  test('does not return a retired alias match', async () => {
    results = [[]]

    await expect(searchArtistsAction('retired alias')).resolves.toEqual([])
    expect(flattenPrimitiveValues(calls[0]?.whereArgs)).toContain(
      '%retired alias%'
    )
    expect(calls).toHaveLength(2)
  })

  test('does not return deleted artists', async () => {
    results = [[]]

    await expect(searchArtistsAction('Active alias')).resolves.toEqual([])
    expect(flattenPrimitiveValues(calls[0]?.whereArgs)).toContain(
      '%Active alias%'
    )
  })

  test('deduplicates matching aliases by artist id', async () => {
    results = [
      [
        {
          id: 7,
          pseudonym: 'Primary alias',
          legacyPseudonym: 'Old legacy',
          city: 'Santiago'
        }
      ],
      [
        { artistId: 7, pseudonym: 'Alias one' },
        { artistId: 7, pseudonym: 'Alias two' }
      ]
    ]

    const found = await searchArtistsAction('Alias')

    expect(found).toHaveLength(1)
    expect(found[0]).toMatchObject({
      id: 7,
      pseudonym: 'Primary alias',
      aliasLabel: 'Alias one, Alias two'
    })
  })
})
