import { expect, test } from 'bun:test'

import { editionSelectSchema } from '../../../../../../../src/app/(core)/eventos/ediciones/_schemas/edition.schema'

test('keeps managed poster fields outside the current edition reader contract', () => {
  const edition = editionSelectSchema.parse({
    id: 1,
    eventoId: 2,
    nombre: 'Edition',
    numeroEdicion: '12',
    slug: 'edition-12',
    posterUrl: 'https://legacy.example/poster.webp',
    editionPosterPath: 'posters/afiche-12.webp',
    editionPosterVersion: 'v1',
    published: false
  })

  expect(edition).not.toHaveProperty('editionPosterPath')
  expect(edition).not.toHaveProperty('editionPosterVersion')
})
