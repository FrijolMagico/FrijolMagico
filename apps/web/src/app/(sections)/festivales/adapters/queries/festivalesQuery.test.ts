import { describe, expect, test } from 'bun:test'

import { FESTIVALES_QUERY } from './festivalesQuery'

describe('FESTIVALES_QUERY', () => {
  test('includes edition slug in evento object', () => {
    expect(FESTIVALES_QUERY).toContain("'edicion_slug', ee.slug")
  })
})
