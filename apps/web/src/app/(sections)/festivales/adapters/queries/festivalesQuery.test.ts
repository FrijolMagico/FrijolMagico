import { describe, expect, test } from 'bun:test'

import { FESTIVALES_QUERY } from './festivalesQuery'

describe('FESTIVALES_QUERY', () => {
  test('counts only confirmed and completed exhibition and activity participation', () => {
    expect(FESTIVALES_QUERY.match(/pexp\.estado IN \('confirmado', 'completado'\)/g)).toHaveLength(2)
    expect(FESTIVALES_QUERY.match(/pact\.estado IN \('confirmado', 'completado'\)/g)).toHaveLength(2)
  })

  test('includes edition slug in evento object', () => {
    expect(FESTIVALES_QUERY).toContain("'edicion_slug', ee.slug")
  })

  test('filters by published = 1', () => {
    expect(FESTIVALES_QUERY).toMatch(/ee\.published\s*=\s*1/)
  })

  test('published predicate appears before final ORDER BY', () => {
    const publishedIdx = FESTIVALES_QUERY.search(/ee\.published\s*=\s*1/)
    const finalOrderByIdx = FESTIVALES_QUERY.lastIndexOf('ORDER BY')

    expect(publishedIdx).toBeGreaterThan(-1)
    expect(finalOrderByIdx).toBeGreaterThan(-1)
    expect(publishedIdx).toBeLessThan(finalOrderByIdx)
  })
})
