import { describe, expect, test } from 'bun:test'

import { FESTIVAL_DETAIL_QUERY } from './festivalDetailQuery'

describe('FESTIVAL_DETAIL_QUERY', () => {
  test('selects edition details with participants and activities', () => {
    expect(FESTIVAL_DETAIL_QUERY).toContain("'edition_id', ee.id")
    expect(FESTIVAL_DETAIL_QUERY).toContain("'participantes'")
    expect(FESTIVAL_DETAIL_QUERY).toContain("'actividades'")
    expect(FESTIVAL_DETAIL_QUERY).toContain('WHERE ee.slug = ?')
    expect(FESTIVAL_DETAIL_QUERY).toContain('AND ee.published = 1')
  })
})
