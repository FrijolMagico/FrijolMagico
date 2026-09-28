import { describe, expect, test } from 'bun:test'

import { CATALOG_QUERY } from './catalogoQuery'

describe('CATALOG_QUERY', () => {
  test('derives public categories only from confirmed and completed exhibitions', () => {
    const categoryQuery = CATALOG_QUERY.split("'category',")[1]?.split("'collective',")[0]

    expect(categoryQuery).toBeDefined()
    expect(categoryQuery?.match(/pexp\.estado IN \('confirmado', 'completado'\)/g)).toHaveLength(2)
  })

  test('resolves catalog display names through the catalog-selected pseudonym', () => {
    expect(CATALOG_QUERY).toContain(
      "'name', COALESCE(catalog_pseudonym.pseudonimo, a.pseudonimo, a.nombre)"
    )
    expect(CATALOG_QUERY).toContain(
      'LEFT JOIN artista_pseudonimo catalog_pseudonym ON catalog_pseudonym.id = ca.pseudonimo_id'
    )
    expect(CATALOG_QUERY).not.toContain('app.pseudonimo_id')
  })

  test('retains visible exhibition and activity categories for direct and collective paths', () => {
    const editionsQuery = CATALOG_QUERY.split("'editions',")[1]

    expect(editionsQuery).toBeDefined()
    expect(editionsQuery?.match(/pexp\.estado IN \('confirmado', 'completado'\)/g)).toHaveLength(2)
    expect(editionsQuery?.match(/pact\.estado IN \('confirmado', 'completado'\)/g)).toHaveLength(2)
    expect(editionsQuery?.match(/'exhibicion' as tipo_participacion/g)).toHaveLength(2)
    expect(editionsQuery?.match(/'actividad' as tipo_participacion/g)).toHaveLength(2)
    expect(editionsQuery?.match(/d\.slug as categoria/g)).toHaveLength(2)
    expect(editionsQuery?.match(/ta\.slug as categoria/g)).toHaveLength(2)
    expect(editionsQuery).toContain('ee.evento_id')
    expect(editionsQuery).toContain('ag.nombre as via_agrupacion')
  })
})
