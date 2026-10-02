import { beforeEach, describe, expect, mock, test } from 'bun:test'

import {
  NOSOTROS_CACHE_TAG,
  ORGANIZATION_CACHE_TAG
} from '@frijolmagico/cache-tags'

const updateTag = mock(() => {})
const revalidateWebCacheBestEffort = mock(async (_options: unknown) => {})
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
let failUpdate = false

const db = {
  update: () => ({
    set: () => ({
      where: async () => {
        if (failUpdate) throw new Error('database update failed')
      }
    })
  })
}

mock.restore()
mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCacheBestEffort
}))
mock.module('@frijolmagico/database/orm', () => ({ db }))

const { updateOrganization } = await import(
  '@/core/organizacion/_actions/organization.action'
)

beforeEach(() => {
  failUpdate = false
  updateTag.mockClear()
  revalidateWebCacheBestEffort.mockClear()
  requireAuth.mockClear()
})

const validOrganization = {
  nombre: 'Organización actualizada',
  descripcion: 'Descripción actualizada',
  mision: 'Misión',
  vision: 'Visión'
}

describe('updateOrganization cache invalidation', () => {
  test('revalidates the Web About cache and preserves local invalidation', async () => {
    const result = await updateOrganization({ success: false }, validOrganization)

    expect(result.success).toBe(true)
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: NOSOTROS_CACHE_TAG,
      mode: 'swr'
    })
    expect(updateTag).toHaveBeenCalledWith(ORGANIZATION_CACHE_TAG)
  })

  test('does not revalidate Web or invalidate locally when the database update fails', async () => {
    failUpdate = true

    const result = await updateOrganization({ success: false }, validOrganization)

    expect(result).toEqual({
      success: false,
      errors: [{ entityType: 'organizacion', message: 'database update failed' }]
    })
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('rejects invalid organization data without cache invalidation', async () => {
    const result = await updateOrganization(
      { success: false },
      { ...validOrganization, nombre: '' }
    )

    expect(result.success).toBe(false)
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })
})
