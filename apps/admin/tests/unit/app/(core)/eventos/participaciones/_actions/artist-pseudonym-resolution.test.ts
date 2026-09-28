import { describe, expect, mock, test } from 'bun:test'

mock.module('server-only', () => ({}))
const { resolveActiveArtistPseudonym } = await import(
  '@/core/eventos/participaciones/_actions/_lib/resolve-artist-pseudonym'
)

function createTransaction(activeIds: number[]) {
  return {
    select: () => ({
      from: () => ({
        where: () => ({ limit: async () => activeIds.map((id) => ({ id })) })
      })
    })
  }
}

describe('resolveActiveArtistPseudonym', () => {
  test('rejects a pseudonym that is not active and owned by the artist', async () => {
    await expect(
      resolveActiveArtistPseudonym(createTransaction([]) as never, 8, 42)
    ).rejects.toThrow('no está activo para este artista')
  })

  test('uses the active primary when a legacy association has no pseudonym ID', async () => {
    const transaction = {
      select: () => ({
        from: () => ({
          innerJoin: () => ({
            where: () => ({ limit: async () => [{ id: 17 }] })
          }),
          where: () => ({ limit: async () => [{ id: 17 }] })
        })
      })
    }

    await expect(
      resolveActiveArtistPseudonym(transaction as never, 8, null)
    ).resolves.toBe(17)
  })
})
