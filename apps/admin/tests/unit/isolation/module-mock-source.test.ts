import { describe, expect, mock, test } from 'bun:test'

const getSession = mock(async () => ({ user: { id: 'admin-1' } }))
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const getUser = mock(async () => ({ id: 'admin-1' }))

mock.module('@/shared/lib/auth/utils', () => ({
  getSession,
  requireAuth,
  getUser
}))

const {
  getSession: mockedGetSession,
  requireAuth: mockedRequireAuth,
  getUser: mockedGetUser
} = await import('@/shared/lib/auth/utils')

describe('module mock source — auth utils', () => {
  test('sees the registered mock on every exported function', () => {
    expect('mock' in mockedGetSession).toBe(true)
    expect('mock' in mockedRequireAuth).toBe(true)
    expect('mock' in mockedGetUser).toBe(true)
  })
})
