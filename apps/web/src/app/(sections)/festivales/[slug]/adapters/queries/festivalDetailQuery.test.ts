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

  test('resolves exhibitions and activities through their own contextual pseudonym IDs', () => {
    expect(FESTIVAL_DETAIL_QUERY).toContain(
      "'pseudonimo', COALESCE(exhibition_pseudonym.pseudonimo, a.pseudonimo, ag.nombre, b.name)"
    )
    expect(FESTIVAL_DETAIL_QUERY).toContain(
      'LEFT JOIN artista_pseudonimo exhibition_pseudonym ON exhibition_pseudonym.id = pexp.pseudonimo_id'
    )
    expect(FESTIVAL_DETAIL_QUERY).toContain(
      'ORDER BY d.slug, COALESCE(exhibition_pseudonym.pseudonimo, a.pseudonimo, ag.nombre, b.name)'
    )
    expect(FESTIVAL_DETAIL_QUERY).toContain(
      "'participante_pseudonimo', COALESCE(activity_pseudonym.pseudonimo, a2.pseudonimo, ag2.nombre, b2.name)"
    )
    expect(FESTIVAL_DETAIL_QUERY).toContain(
      'LEFT JOIN artista_pseudonimo activity_pseudonym ON activity_pseudonym.id = pact.pseudonimo_id'
    )
  })

  test('exposes only confirmed and completed exhibition and activity participation', () => {
    expect(FESTIVAL_DETAIL_QUERY).toContain(
      "AND pexp.estado IN ('confirmado', 'completado')"
    )
    expect(FESTIVAL_DETAIL_QUERY).toContain(
      "AND pact.estado IN ('confirmado', 'completado')"
    )
  })

  test('selects activity artist contact data from the participating artist and active catalog', () => {
    expect(FESTIVAL_DETAIL_QUERY).toContain(
      "'catalogo_slug', CASE WHEN ca2.id IS NOT NULL THEN a2.slug ELSE NULL END"
    )
    expect(FESTIVAL_DETAIL_QUERY).toContain(
      "'avatar_url', CASE WHEN ca2.id IS NOT NULL THEN ("
    )
    expect(FESTIVAL_DETAIL_QUERY).toContain("ai.tipo = 'avatar'")
    expect(FESTIVAL_DETAIL_QUERY).toContain('ai.deleted_at IS NULL')
    expect(FESTIVAL_DETAIL_QUERY).toContain(
      'ORDER BY ai.created_at DESC, ai.id DESC'
    )
    expect(FESTIVAL_DETAIL_QUERY).toContain("'rrss', a2.rrss")
    expect(FESTIVAL_DETAIL_QUERY).toContain("'correo', a2.correo")
    expect(FESTIVAL_DETAIL_QUERY).toContain(
      'LEFT JOIN catalogo_artista ca2 ON ca2.artista_id = a2.id'
    )
    expect(FESTIVAL_DETAIL_QUERY).toContain(
      'AND ca2.activo = 1 AND ca2.deleted_at IS NULL'
    )
  })

  test('returns ordered occurrence rows per activity without inventing an edition date', () => {
    expect(FESTIVAL_DETAIL_QUERY).toContain('FROM activity_occurrence ao')
    expect(FESTIVAL_DETAIL_QUERY).toContain('WHERE ao.activity_id = ac.id')
    expect(FESTIVAL_DETAIL_QUERY).toContain(
      'ORDER BY ao.date, ao.start_time, ao.id'
    )
    expect(FESTIVAL_DETAIL_QUERY).toContain(
      "'duracion_minutos', scheduled.duration_minutes"
    )
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
