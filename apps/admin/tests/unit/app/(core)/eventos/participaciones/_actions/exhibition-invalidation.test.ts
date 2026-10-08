import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  CATALOG_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'

const invalidationSequence: string[] = []
const updateTag = mock(() => {
  invalidationSequence.push('local')
})
const revalidateWebCacheBestEffort = mock(async (_options: unknown) => {})
const revalidateWebCacheBatch = mock(
  async (_requests: unknown, _context?: string): Promise<{ webRevalidation?: 'swr' | 'immediate' }> => {
    invalidationSequence.push('batch')
    return { webRevalidation: 'swr' }
  }
)
const requireAuth = mock(async () => ({ user: { id: 'admin-1' } }))
const findOrCreateEditionParticipation = mock(async () => ({ id: 12 }))
const resolveActiveArtistPseudonym = mock(async (): Promise<number | null> => null)
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
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCacheBestEffort,
  revalidateWebCacheBatch
}))
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
} as const

const publicRequests = (catalogChanged: boolean) => [
  { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
  { tag: FESTIVALES_CACHE_TAG, mode: 'swr' },
  ...(catalogChanged
    ? [{ tag: CATALOG_CACHE_TAG }, { tag: CATALOG_PARTICIPATION_CACHE_TAG }]
    : [])
]

const expectBatch = (
  requests: ReturnType<typeof publicRequests>,
  context: 'create-exhibition' | 'update-exhibition'
) => {
  expect(revalidateWebCacheBatch).toHaveBeenCalledWith(requests, context)
  expect(invalidationSequence.at(-1)).toBe('batch')
  expect(invalidationSequence.slice(0, -1)).toContain('local')
}

const expectNoFestivalPaths = () => {
  expect(revalidateWebCacheBatch.mock.calls[0]?.[0]).not.toContainEqual(
    expect.objectContaining({ path: expect.any(String) })
  )
}

const expectDeleteBatch = (
  requests: ReturnType<typeof publicRequests>
) => {
  expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
    requests,
    'delete-exhibition'
  )
  expect(invalidationSequence.at(-1)).toBe('batch')
  expect(invalidationSequence.slice(0, -1)).toContain('local')
}

describe('exhibition public cache invalidation', () => {
  beforeEach(() => {
    invalidationSequence.length = 0
    updateTag.mockClear()
    revalidateWebCacheBestEffort.mockClear()
    revalidateWebCacheBatch.mockClear()
    revalidateWebCacheBatch.mockImplementation(
      async (_requests: unknown, _context?: string) => {
        invalidationSequence.push('batch')
        return { webRevalidation: 'swr' as const }
      }
    )
    requireAuth.mockClear()
    findOrCreateEditionParticipation.mockClear()
    resolveActiveArtistPseudonym.mockClear()
    resolveActiveArtistPseudonym.mockResolvedValue(null)
    deleteOrphanedEditionParticipation.mockClear()
    values.mockClear()
    insert.mockClear()
    set.mockClear()
    update.mockClear()
    deleteWhere.mockClear()
    deleteQuery.mockClear()
    findFirst.mockClear()
    transaction.mockClear()
    transaction.mockImplementation(async (callback: (tx: unknown) => Promise<void>) =>
      callback(transactionResult)
    )
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
    expectBatch(publicRequests(true), 'create-exhibition')
    expect(result.webRevalidation).toBe('swr')
  })

  test('creates a non-public exhibition with tag-only invalidation', async () => {
    transactionResult = {
      insert,
      query: { participationExhibition: { findFirst } }
    }

    const result = await createExhibitionAction({
      participation,
      exhibition: { ...exhibition, estado: 'seleccionado' }
    })

    expect(result.success).toBe(true)
    expectBatch(publicRequests(false), 'create-exhibition')
    expect(result.webRevalidation).toBe('swr')
    expectNoFestivalPaths()
  })

  test('waits for the requested batch before returning a successful creation', async () => {
    transactionResult = {
      insert,
      query: { participationExhibition: { findFirst } }
    }

    let releaseBatch!: (summary: { webRevalidation?: 'swr' | 'immediate' }) => void
    let markBatchStarted!: () => void
    const batchStarted = new Promise<void>((resolve) => {
      markBatchStarted = resolve
    })
    revalidateWebCacheBatch.mockImplementation(
      async (_requests: unknown, _context?: string) => {
        invalidationSequence.push('batch')
        markBatchStarted()
        return new Promise((resolve) => {
          releaseBatch = resolve
        })
      }
    )

    let settled = false
    const pendingAction = createExhibitionAction({ participation, exhibition }).then(
      (result) => {
        settled = true
        return result
      }
    )
    await batchStarted

    expect(settled).toBe(false)
    expect(invalidationSequence.at(-1)).toBe('batch')
    expect(invalidationSequence.slice(0, -1)).toContain('local')
    releaseBatch({ webRevalidation: 'swr' })
    const result = await pendingAction

    expect(result).toEqual({ success: true, webRevalidation: 'swr' })
  })

  test('omits freshness metadata when the batch requests no summary', async () => {
    transactionResult = {
      insert,
      query: { participationExhibition: { findFirst } }
    }
    revalidateWebCacheBatch.mockImplementation(async () => ({}))

    const result = await createExhibitionAction({ participation, exhibition })

    expect(result).toEqual({ success: true })
  })

  test('does not revalidate when creation persistence fails', async () => {
    transaction.mockRejectedValue(new Error('database failed'))

    const result = await createExhibitionAction({ participation, exhibition })

    expect(result.success).toBe(false)
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
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
    expectBatch(publicRequests(true), 'update-exhibition')
    expect(result.webRevalidation).toBe('swr')
  })

  test('does not revalidate festival routes for a public status transition alone', async () => {
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
      estado: 'completado'
    } as Parameters<typeof updateExhibitionAction>[0])

    expect(result.success).toBe(true)
    expectBatch(publicRequests(true), 'update-exhibition')
    expect(result.webRevalidation).toBe('swr')
    expectNoFestivalPaths()
  })

  test('revalidates only the festival detail for a public pseudonym change', async () => {
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
    resolveActiveArtistPseudonym.mockResolvedValue(7)
    findFirst.mockResolvedValue(existing)
    transactionResult = {
      query: { participationExhibition: { findFirst } },
      update
    }

    const result = await updateExhibitionAction({
      id: 21,
      participacionId: 12,
      artistaId: 5,
      pseudonimoId: 7,
      disciplinaId: 1,
      modoIngresoId: 1,
      estado: 'confirmado'
    } as Parameters<typeof updateExhibitionAction>[0])

    expect(result.success).toBe(true)
    expectBatch(publicRequests(true), 'update-exhibition')
    expect(result.webRevalidation).toBe('swr')
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
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
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

    expect(result).toEqual({
      success: true,
      data: { alreadyAbsent: false, participationDeleted: false },
      webRevalidation: 'swr'
    })
    expectDeleteBatch(publicRequests(true))
  })

  test('deletes a non-public exhibition with tag-only invalidation', async () => {
    findFirst.mockResolvedValue({
      id: 21,
      participacionId: 12,
      estado: 'seleccionado',
      participacion: { edicionId: 9 }
    })
    transactionResult = {
      query: { participationExhibition: { findFirst } },
      delete: deleteQuery
    }

    const result = await deleteExhibitionAction(null as never, { id: 21 })

    expect(result).toEqual({
      success: true,
      data: { alreadyAbsent: false, participationDeleted: false },
      webRevalidation: 'swr'
    })
    expectDeleteBatch(publicRequests(false))
  })

  test('awaits deletion invalidation before returning and merges its freshness summary', async () => {
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
    let releaseBatch!: (summary: { webRevalidation?: 'swr' | 'immediate' }) => void
    let markBatchStarted!: () => void
    const batchStarted = new Promise<void>((resolve) => {
      markBatchStarted = resolve
    })
    revalidateWebCacheBatch.mockImplementation(
      async (_requests: unknown, _context?: string) => {
        invalidationSequence.push('batch')
        markBatchStarted()
        return new Promise((resolve) => {
          releaseBatch = resolve
        })
      }
    )

    let settled = false
    const pendingAction = deleteExhibitionAction(null as never, { id: 21 }).then(
      (result) => {
        settled = true
        return result
      }
    )
    await batchStarted

    expect(settled).toBe(false)
    expect(invalidationSequence.at(-1)).toBe('batch')
    expect(invalidationSequence.slice(0, -1)).toContain('local')
    expect(revalidateWebCacheBatch).toHaveBeenCalledWith(
      publicRequests(true),
      'delete-exhibition'
    )
    releaseBatch({ webRevalidation: 'swr' })

    expect(await pendingAction).toEqual({
      success: true,
      data: { alreadyAbsent: false, participationDeleted: false },
      webRevalidation: 'swr'
    })
  })

  test('omits delete freshness metadata when the requested batch has no summary', async () => {
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
    revalidateWebCacheBatch.mockImplementation(async () => ({}))

    expect(await deleteExhibitionAction(null as never, { id: 21 })).toEqual({
      success: true,
      data: { alreadyAbsent: false, participationDeleted: false }
    })
    expect(revalidateWebCacheBatch).toHaveBeenCalledTimes(1)
  })

  test('does not invalidate caches when deleting an already absent exhibition', async () => {
    findFirst.mockResolvedValue(null)
    transactionResult = {
      query: { participationExhibition: { findFirst } },
      delete: deleteQuery
    }

    const result = await deleteExhibitionAction(null as never, { id: 21 })

    expect(result).toEqual({
      success: true,
      data: { alreadyAbsent: true, participationDeleted: false }
    })
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
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
    expect(revalidateWebCacheBatch).not.toHaveBeenCalled()
    expect(revalidateWebCacheBestEffort).not.toHaveBeenCalled()
    expect(updateTag).not.toHaveBeenCalled()
  })
})
