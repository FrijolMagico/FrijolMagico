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

  test('left joins registration by participation activity without filtering by time', () => {
    expect(FESTIVAL_DETAIL_QUERY).toContain(
      'LEFT JOIN activity_registration ar ON ar.participation_activity_id = pact.id'
    )
    expect(FESTIVAL_DETAIL_QUERY).toMatch(
      /'registration', CASE WHEN ar\.id IS NOT NULL\s+THEN json_object\(\s*'url', ar\.url,\s*'start_at', ar\.start_at,\s*'end_at', ar\.end_at\s*\)\s+ELSE NULL END/
    )
    expect(FESTIVAL_DETAIL_QUERY).not.toMatch(
      /CURRENT_TIMESTAMP|datetime\s*\(|strftime\s*\(|julianday\s*\(|date\s*\(\s*['"]now['"]/i
    )
    expect(FESTIVAL_DETAIL_QUERY).not.toMatch(
      /(?:ar\.start_at|ar\.end_at)\s*(?:<|>|=)/
    )
  })
})
