import { describe, expect, test } from 'bun:test'
import { getPosterUrl } from '@frijolmagico/utils/cdn'
import { composeEditions } from '../../../../../../../src/app/(core)/eventos/ediciones/_lib/compose-editions'
import type { Edition } from '../../../../../../../src/app/(core)/eventos/ediciones/_schemas/edition.schema'

describe('composeEditions poster display', () => {
  const edition = (posterUrl: string | null): Edition => ({
    id: 1,
    eventoId: 2,
    nombre: 'Edition',
    numeroEdicion: '1',
    slug: 'edition',
    posterUrl,
    published: false
  })

  test('resolves a relative key without changing the persisted value', () => {
    const [result] = composeEditions([edition('posters/one.webp')], [], [], [])
    expect(result.posterDisplayUrl).toBe(getPosterUrl('posters/one.webp'))
    expect(result.posterUrl).toBe('posters/one.webp')
  })

  test('preserves remote URLs and null display state', () => {
    const results = composeEditions(
      [edition('https://legacy.example/one.webp'), edition(null)],
      [],
      [],
      []
    )
    expect(
      results.map(({ posterDisplayUrl, posterUrl }) => [
        posterDisplayUrl,
        posterUrl
      ])
    ).toEqual([
      ['https://legacy.example/one.webp', 'https://legacy.example/one.webp'],
      [null, null]
    ])
  })
})
