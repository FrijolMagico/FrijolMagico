import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  CATALOG_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

const updateTag = mock(() => {})
const revalidateWebCacheBestEffort = mock(async (_options: unknown) => {})
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const findOrCreateEditionParticipation = mock(async () => ({ id: 12 }))
const resolveActiveArtistPseudonym = mock(async () => null)
const deleteOrphanedEditionParticipation = mock(async () => false)
const values = mock(async (_data: unknown) => {})
const insert = mock(() => ({ values }))
const set = mock(() => ({ where: mock(async () => {}) }))
const update = mock(() => ({ set }))
const deleteWhere = mock(async () => {})
const deleteQuery = mock(() => ({ where: deleteWhere }))
const findFirst = mock(async (_query: unknown) => null as unknown)

let transactionResult: unknown
const transaction = mock(async (callback: (tx: unknown) => Promise<void>) =>
  callback(transactionResult)
)

mock.restore()
mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ updateTag }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth }))
mock.module('@/shared/lib/web-invalidation', () => ({ revalidateWebCacheBestEffort }))
mock.module('@frijolmagico/database/orm', () => ({
  db: {
    transaction,
    insert,
    update,
    delete: deleteQuery
  }
}))
mock.module(
  '@/core/eventos/participaciones/_actions/_lib/find-or-create-edition-participation',
  () => ({ findOrCreateEditionParticipation })
)
mock.module(
  '@/core/eventos/participaciones/_actions/_lib/resolve-artist-pseudonym',
  () => ({ resolveActiveArtistPseudonym })
)
mock.module(
  '@/core/eventos/participaciones/_actions/participations/delete-orphaned-edition-participation',
  () => ({ deleteOrphanedEditionParticipation })
)

const { createExhibitionAction } = await import(
  '@/core/eventos/participaciones/_actions/exhibitions/create-exhibition.action'
)
const { updateExhibitionAction } = await import(
  '@/core/eventos/participaciones/_actions/exhibitions/update-exhibition.action'
)
const { deleteExhibitionAction } = await import(
  '@/core/eventos/participaciones/_actions/exhibitions/delete-exhibition.action'
)

const participation = {
  edicionId: 9,
  artistaId: 5,
  agrupacionId: null,
  bandaId: null
}

const exhibition = {
  artistaId: 5,
  pseudonimoId: null,
  disciplinaId: 1,
  modoIngresoId: 1,
  estado: 'confirmado'
}

const successfulPublicInvalidation = () => {
  expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
    tag: FESTIVAL_CRITICAL_CACHE_TAG,
    mode: 'immediate'
  })
  expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
    tag: FESTIVALES_CACHE_TAG,
    mode: 'swr'
  })
}

describe('exhibition public cache invalidation', () => {
  beforeEach(() => {
    updateTag.mockClear()
    revalidateWebCacheBestEffort.mockClear()
    requireAuth.mockClear()
    findOrCreateEditionParticipation.mockClear()
    resolveActiveArtistPseudonym.mockClear()
    deleteOrphanedEditionParticipation.mockClear()
    values.mockClear()
    insert.mockClear()
    set.mockClear()
    update.mockClear()
    deleteWhere.mockClear()
    deleteQuery.mockClear()
    findFirst.mockClear()
    transaction.mockClear()
  })

  test('creates a public exhibition, preserving catalog invalidation', async () => {
    transactionResult = {
      insert,
      query: { participationExhibition: { findFirst } }
    }

    const result = await createExhibitionAction({
      participation,
      exhibition
    })

    expect(result.success).toBe(true)
    successfulPublicInvalidation()
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: CATALOG_CACHE_TAG
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: CATALOG_PARTICIPATION_CACHE_TAG
    })
  })

  test('updates a public exhibition, preserving catalog invalidation', async () => {
    const existing = {
      id: 21,
      participacionId: 12,
      artistaId: 5,
      pseudonimoId: null,
      disciplinaId: 1,
      modoIngresoId: 1,
      estado: 'confirmado',
      participacion: { edicionId: 9 }
    }
    findFirst.mockResolvedValue(existing)
    transactionResult = {
      query: { participationExhibition: { findFirst } },
      update
    }

    const result = await updateExhibitionAction({
      id: 21,
      participacionId: 12,
      artistaId: 5,
      pseudonimoId: null,
      disciplinaId: 2,
      modoIngresoId: 1,
      estado: 'confirmado'
    } as Parameters<typeof updateExhibitionAction>[0])

    expect(result.success).toBe(true)
    successfulPublicInvalidation()
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: CATALOG_CACHE_TAG
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: CATALOG_PARTICIPATION_CACHE_TAG
    })
  })

  test('does not invalidate public or catalog data for an unchanged exhibition', async () => {
    const existing = {
      id: 21,
      participacionId: 12,
      artistaId: 5,
      pseudonimoId: null,
      disciplinaId: 1,
      modoIngresoId: 1,
      estado: 'confirmado',
      participacion: { edicionId: 9 }
    }
    findFirst.mockResolvedValue(existing)
    transactionResult = {
      query: { participationExhibition: { findFirst } },
      update
    }

    const result = await updateExhibitionAction({
      id: 21,
      participacionId: 12,
      artistaId: 5,
      pseudonimoId: null,
      disciplinaId: 1,
      modoIngresoId: 1,
      estado: 'confirmado'
    } as Parameters<typeof updateExhibitionAction>[0])

    expect(result.success).toBe(true)
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('deletes a public exhibition, preserving catalog invalidation', async () => {
    findFirst.mockResolvedValue({
      id: 21,
      participacionId: 12,
      estado: 'confirmado',
      participacion: { edicionId: 9 }
    })
    transactionResult = {
      query: { participationExhibition: { findFirst } },
      delete: deleteQuery
    }

    const result = await deleteExhibitionAction(null as never, { id: 21 })

    expect(result.success).toBe(true)
    successfulPublicInvalidation()
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: CATALOG_CACHE_TAG
    })
    expect(revalidateWebCacheBestEffort).toHaveBeenCalledWith({
      tag: CATALOG_PARTICIPATION_CACHE_TAG
    })
  })

  test('does not invalidate caches when deleting an already absent exhibition', async () => {
    findFirst.mockResolvedValue(null)
    transactionResult = {
      query: { participationExhibition: { findFirst } },
      delete: deleteQuery
    }

    const result = await deleteExhibitionAction(null as never, { id: 21 })

    expect(result.success).toBe(true)
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })

  test('does not invalidate caches when the exhibition delete fails', async () => {
    findFirst.mockResolvedValue({
      id: 21,
      participacionId: 12,
      estado: 'confirmado',
      participacion: { edicionId: 9 }
    })
    deleteWhere.mockRejectedValue(new Error('delete failed'))
    transactionResult = {
      query: { participationExhibition: { findFirst } },
      delete: deleteQuery
    }

    const result = await deleteExhibitionAction(null as never, { id: 21 })

    expect(result.success).toBe(false)
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })
})
