import { describe, expect, mock, test } from 'bun:test'
import { artist } from '@frijolmagico/database/schema'

mock.module('server-only', () => ({}))
const { allocateCatalogSlug } = await import(
  '@/core/artistas/catalogo/_lib/catalog-slug'
)

function createTransaction(
  currentSlug: string,
  canonicalLookups: boolean[],
  aliasLookups: boolean[] = []
) {
  const canonicalResults = [...canonicalLookups]
  const aliasResults = [...aliasLookups]
  const updates: Record<string, unknown>[] = []
  const aliases: Record<string, unknown>[] = []
  let initialArtistLookup = true

  const transaction = {
    select: () => ({
      from: (table: unknown) => ({
        where: () => ({
          limit: async () => {
            if (table === artist.artist && initialArtistLookup) {
              initialArtistLookup = false
              return [{ slug: currentSlug }]
            }
            if (table === artist.artist) {
              return canonicalResults.shift() ? [{ id: 99 }] : []
            }
            if (table === artist.artistSlugAlias) {
              return aliasResults.shift() ? [{ artistaId: 99 }] : []
            }
            throw new Error('Unexpected slug lookup table')
          }
        })
      })
    }),
    delete: () => ({ where: async () => undefined }),
    update: () => ({
      set: (values: Record<string, unknown>) => ({
        where: async () => {
          updates.push(values)
        }
      })
    }),
    insert: () => ({
      values: async (values: Record<string, unknown>) => {
        aliases.push(values)
      }
    })
  }

  return { transaction, updates, aliases }
}

describe('allocateCatalogSlug', () => {
  test('uses an available selected pseudonym as canonical slug and preserves the previous slug', async () => {
    const { transaction, updates, aliases } = createTransaction('old-name', [false])

    const changed = await allocateCatalogSlug(transaction as never, 7, 'New Name')

    expect(changed).toBe(true)
    expect(updates).toEqual([{ slug: 'new-name' }])
    expect(aliases).toEqual([{ slug: 'old-name', artistaId: 7 }])
  })

  test('adds the previous canonical slug to a colliding desired slug', async () => {
    const { transaction, updates, aliases } = createTransaction('old-name', [true, false])

    await allocateCatalogSlug(transaction as never, 7, 'Claimed Name')

    expect(updates).toEqual([{ slug: 'old-name-claimed-name' }])
    expect(aliases).toEqual([{ slug: 'old-name', artistaId: 7 }])
  })

  test('keeps extending the additive slug when earlier candidates are occupied', async () => {
    const { transaction, updates } = createTransaction('old', [true, true, true, false])

    await allocateCatalogSlug(transaction as never, 7, 'Name')

    expect(updates).toEqual([{ slug: 'old-name-name-name' }])
  })
})
