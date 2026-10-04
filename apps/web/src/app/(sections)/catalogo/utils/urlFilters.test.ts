import '../../../../../test-setup'

import { afterEach, describe, expect, test } from 'bun:test'
import { updateURLParams } from './urlFilters'

afterEach(() => {
  window.history.replaceState(null, '', '/catalogo')
})

describe('catalog filter URL updates', () => {
  test('preserves a pending artist selection while replacing filter parameters', () => {
    window.history.replaceState(
      null,
      '',
      '/catalogo?artista=canela&category=musica'
    )

    updateURLParams({ category: ['arte'], city: [], country: [], search: '' })

    const params = new URLSearchParams(window.location.search)
    expect(params.get('artista')).toBe('canela')
    expect(params.get('category')).toBe('arte')
  })
})
