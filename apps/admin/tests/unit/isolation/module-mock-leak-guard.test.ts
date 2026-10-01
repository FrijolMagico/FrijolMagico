import { describe, expect, mock, test } from 'bun:test'

mock.module('server-only', () => ({}))
mock.module('@/shared/lib/auth/server', () => ({
  auth: { api: { getSession: async () => null } }
}))

const { getSession, requireAuth, getUser } = await import('@/shared/lib/auth/utils')

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
