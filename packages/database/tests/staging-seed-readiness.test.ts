import { describe, expect, test } from 'bun:test'

import { checkStagingSeedReadiness } from '../scripts/check-staging-seed'

describe('offline staging seed readiness', () => {
  test('migrates an empty temporary database and atomically loads the fixture with foreign keys enabled', async () => {
    await expect(checkStagingSeedReadiness()).resolves.toEqual({
      statements: 654,
      counts: {
        artista: 70,
        catalogo_artista: 38,
        temp_edition_participations: 60
      },
      foreignKeyViolations: 0
    })
  })
})
