import { expect, test } from 'bun:test'

import { ADJACENT_FESTIVALS_QUERY } from './adjacentFestivalsQuery'

test('adjacent festivals exclude unpublished editions', () => {
  expect(ADJACENT_FESTIVALS_QUERY).toContain('WHERE ee.published = 1')
})
