import { describe, expect, test } from 'bun:test'

import { CATALOG_QUERY } from './catalogoQuery'

describe('CATALOG_QUERY', () => {
  test('derives public categories only from confirmed and completed exhibitions', () => {
    const categoryQuery = CATALOG_QUERY.split("'category',")[1]?.split("'collective',")[0]

    expect(categoryQuery).toBeDefined()
    expect(categoryQuery?.match(/pexp\.estado IN \('confirmado', 'completado'\)/g)).toHaveLength(2)
  })

  test('includes public edition metadata only for visible participation', () => {
    const editionsQuery = CATALOG_QUERY.split("'editions',")[1]

    expect(editionsQuery).toBeDefined()
    expect(editionsQuery?.match(/pexp\.estado IN \('confirmado', 'completado'\)/g)).toHaveLength(2)
    expect(editionsQuery?.match(/pact\.estado IN \('confirmado', 'completado'\)/g)).toHaveLength(2)
  })
})
