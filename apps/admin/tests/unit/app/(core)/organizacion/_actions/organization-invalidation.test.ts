import { beforeEach, describe, expect, mock, test } from 'bun:test'

import {
  NOSOTROS_CACHE_TAG,
  ORGANIZATION_CACHE_TAG
} from '@frijolmagico/cache-tags'

const updateTag = mock(() => {})
const revalidateWebCacheBestEffort = mock(async (_options: unknown) => {})
const revalidateWebCacheBatch = mock(
  async (_requests: unknown[], _operation?: string) => ({
    webRevalidation: 'swr' as const
  })
)
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
let failUpdate = false
let failAuth = false

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
  revalidateWebCacheBestEffort,
  revalidateWebCacheBatch
}))
mock.module('@frijolmagico/database/orm', () => ({ db }))

const { updateOrganization } = await import(
  '@/core/organizacion/_actions/organization.action'
)

beforeEach(() => {
  failUpdate = false
  failAuth = false
  updateTag.mockClear()
  revalidateWebCacheBestEffort.mockClear()
  revalidateWebCacheBatch.mockClear()
  requireAuth.mockClear()
  requireAuth.mockImplementation(async () => {
    if (failAuth) throw new Error('authentication failed')
    return { user: { id: 'admin-1' } }
  })
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

    expect(result).toEqual({
      success: true,
      data: {
        nombre: validOrganization.nombre,
        descripcion: validOrganization.descripcion,
        mision: validOrganization.mision,
        vision: validOrganization.vision
      },
      webRevalidation: 'swr'
    })
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      [{ tag: NOSOTROS_CACHE_TAG, mode: 'swr' }],
      'update-organization'
    )
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
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
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('rejects invalid organization data without cache invalidation', async () => {
    const result = await updateOrganization(
      { success: false },
      { ...validOrganization, nombre: '' }
    )

    expect(result.success).toBe(false)
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('does not invalidate cache when authentication fails', async () => {
    failAuth = true

    const result = await updateOrganization({ success: false }, validOrganization)

    expect(result).toEqual({
      success: false,
      errors: [{ entityType: 'organizacion', message: 'authentication failed' }]
    })
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })
})
