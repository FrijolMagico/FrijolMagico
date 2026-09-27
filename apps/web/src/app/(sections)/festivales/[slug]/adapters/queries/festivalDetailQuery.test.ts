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

  test('returns ordered occurrence rows per activity without inventing an edition date', () => {
    expect(FESTIVAL_DETAIL_QUERY).toContain('FROM activity_occurrence ao')
    expect(FESTIVAL_DETAIL_QUERY).toContain('WHERE ao.activity_id = ac.id')
    expect(FESTIVAL_DETAIL_QUERY).toContain('ORDER BY ao.date, ao.start_time, ao.id')
    expect(FESTIVAL_DETAIL_QUERY).toContain("'duracion_minutos', scheduled.duration_minutes")
    expect(FESTIVAL_DETAIL_QUERY).not.toContain('SELECT MIN(eed.fecha)')
    expect(FESTIVAL_DETAIL_QUERY).not.toContain("'hora_inicio', ac.hora_inicio")
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
