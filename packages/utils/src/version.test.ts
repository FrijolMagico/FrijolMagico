import { describe, expect, test } from 'bun:test'

import { APP_VERSION } from './version'

describe('APP_VERSION', () => {
  test('reads current version from root package.json', () => {
    // The import should resolve to the root package.json version
    expect(APP_VERSION).toBe('4.2.0')
  })

  test('is a non-empty string', () => {
    expect(typeof APP_VERSION).toBe('string')
    expect(APP_VERSION.length).toBeGreaterThan(0)
  })
})
