import { describe, expect, test } from 'bun:test'

import { FESTIVALES_QUERY } from './festivalesQuery'

describe('FESTIVALES_QUERY', () => {
  test('includes edition slug in evento object', () => {
    expect(FESTIVALES_QUERY).toContain("'edicion_slug', ee.slug")
  })

  test('aggregates distinct talk participants by the charla activity slug', () => {
    expect(FESTIVALES_QUERY).toMatch(
      /'charlas',\s*\(\s*SELECT COUNT\(DISTINCT ped\.id\)[\s\S]*?ta\.slug = 'charla'/
    )
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
