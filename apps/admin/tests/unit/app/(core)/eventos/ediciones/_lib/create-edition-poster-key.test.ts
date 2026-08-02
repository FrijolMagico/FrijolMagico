import { expect, test } from 'bun:test'

import { createEditionPosterKey } from '../../../../../../../src/app/(core)/eventos/ediciones/_lib/create-edition-poster-key'

test('creates the exact edition-boundary poster key', () => {
  expect(createEditionPosterKey('12')).toBe('afiche-12.webp')
})
