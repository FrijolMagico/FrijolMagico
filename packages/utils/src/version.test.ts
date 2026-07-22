import { describe, expect, test } from 'bun:test'

import { APP_VERSION } from './version'

describe('APP_VERSION', () => {
  test('reads current version from root package.json', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/)
  })

  test('is a non-empty string', () => {
    expect(typeof APP_VERSION).toBe('string')
    expect(APP_VERSION.length).toBeGreaterThan(0)
  })
})
