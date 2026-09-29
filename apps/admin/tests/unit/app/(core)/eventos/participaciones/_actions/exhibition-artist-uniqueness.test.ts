import { describe, expect, mock, test } from 'bun:test'

mock.module('server-only', () => ({}))
const { findOrCreateEditionParticipation } = await import(
  '@/core/eventos/participaciones/_actions/_lib/find-or-create-edition-participation'
)

describe('exhibition artist uniqueness', () => {
  test('finds the edition participation by artist ID, not pseudonym ID', async () => {
    const whereCalls: unknown[] = []
    const tx = {
      query: {
        editionParticipation: {
          findFirst: async (query: { where: (table: Record<string, string>, operators: Record<string, (...args: unknown[]) => unknown>) => unknown }) => {
            query.where(
              { edicionId: 'edition', artistaId: 'artist' },
              {
                and: (...conditions: unknown[]) => conditions,
                eq: (column: unknown, value: unknown) => {
                  whereCalls.push([column, value])
                  return [column, value]
                }
              }
            )
            return { id: 15 }
          }
        }
      },
      insert: () => {
        throw new Error('existing artist participation should be reused')
      }
    }

    const result = await findOrCreateEditionParticipation(tx as never, {
      edicionId: 9,
      artistaId: 5,
      agrupacionId: null,
      bandaId: null
    })

    expect(result).toEqual({ id: 15 })
    expect(whereCalls).toEqual([
      [expect.anything(), 9],
      [expect.anything(), 5]
    ])
  })
})
