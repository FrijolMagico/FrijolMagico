import { describe, expect, mock, test } from 'bun:test'

mock.module('server-only', () => ({}))

import { getSession, requireAuth, getUser } from '@/shared/lib/auth/utils'

describe('module mock leak guard — auth utils', () => {
  test('loads the real auth utils without any Bun mock API attached', () => {
    expect(typeof getSession).toBe('function')
    expect(typeof requireAuth).toBe('function')
    expect(typeof getUser).toBe('function')
    expect('mock' in getSession).toBe(false)
    expect('mock' in requireAuth).toBe(false)
    expect('mock' in getUser).toBe(false)
  })
})
