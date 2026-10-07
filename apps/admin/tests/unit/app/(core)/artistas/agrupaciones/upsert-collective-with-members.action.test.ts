import { beforeEach, describe, expect, mock, test } from 'bun:test'

const writes: Array<{ table: unknown; values?: unknown; update?: unknown }> = []
const selectResults: unknown[][] = []
const webInvalidationBatches: Array<{ requests: unknown[]; context?: string }> = []
let selectCount = 0
let transactionFailure: Error | null = null

const transaction = {
  select: () => {
    const currentSelect = selectCount++
    const builder = {
      from: () => builder,
      where: async () => {
        if (currentSelect === 0) return [{ nombre: 'Collective', activo: true }]
        if (currentSelect === 1) return []
        return selectResults.shift() ?? []
      }
    }
    return builder
  },
  update: (table: unknown) => {
    const builder = {
      set: (values: unknown) => {
        writes.push({ table, update: values })
        return builder
      },
      where: async () => {
        if (transactionFailure) throw transactionFailure
      }
    }
    return builder
  },
  insert: (table: unknown) => ({
    values: async (values: unknown) => writes.push({ table, values })
  })
}

const dbMock = {
  transaction: async <T>(callback: (tx: typeof transaction) => Promise<T>) =>
    callback(transaction)
}

mock.module('server-only', () => ({}))
mock.module('@frijolmagico/database/orm', () => ({ db: dbMock }))
mock.module('@/shared/lib/auth/utils', () => ({ requireAuth: async () => ({}) }))
mock.module('next/cache', () => ({ updateTag: () => undefined }))
mock.module('@/shared/lib/web-invalidation', () => ({
  revalidateWebCacheBestEffort: () => undefined,
  revalidateWebCacheBatch: async (requests: unknown[], context?: string) => {
    webInvalidationBatches.push({ requests, context })
    const hasSWR = requests.some((request) => {
      const { tag, mode } = request as { tag: string; mode?: string }
      return mode === 'swr' || (mode === undefined && tag !== 'festivales:critico')
    })
    return hasSWR
      ? { webRevalidation: 'swr' }
      : requests.length > 0
        ? { webRevalidation: 'immediate' }
        : {}
  }
}))

const { upsertCollectiveWithMembersAction } = await import(
  '@/core/artistas/agrupaciones/_actions/upsert-collective-with-members.action'
)

const basePayload = {
  collectiveId: 1,
  fields: {
    nombre: 'Collective',
    descripcion: '',
    correo: '',
    activo: true
  },
  pendingAdds: [],
  pendingUpdates: [],
  pendingRemovals: []
}

beforeEach(() => {
  writes.length = 0
  selectResults.length = 0
  webInvalidationBatches.length = 0
  selectCount = 0
  transactionFailure = null
})

describe('upsertCollectiveWithMembersAction alias validation', () => {
  test('inserts a new member with the selected alias', async () => {
    selectResults.push([{ id: 31 }], [])

    const result = await upsertCollectiveWithMembersAction(
      { success: false },
      {
        ...basePayload,
        pendingAdds: [
          { artistId: 7, pseudonymId: 31, role: 'Guitarra', active: true }
        ]
      }
    )

    expect(result.success).toBe(true)
    expect(writes.some((write) =>
      JSON.stringify(write.values) ===
      JSON.stringify({
        agrupacionId: 1,
        artistaId: 7,
        pseudonimoId: 31,
        rol: 'Guitarra',
        activo: true
      })
    )).toBe(true)
    expect(webInvalidationBatches).toEqual([
      {
        requests: [
          { tag: 'catalogo:artistas:base' },
          { tag: 'catalogo:artistas:participaciones' },
          { tag: 'catalogo:artistas' }
        ],
        context: 'upsert-collective-with-members'
      }
    ])
  })

  test('reactivates an existing member and changes their alias', async () => {
    selectResults.push([{ id: 32 }], [{ collectiveId: 1, artistId: 7 }])

    const result = await upsertCollectiveWithMembersAction(
      { success: false },
      {
        ...basePayload,
        pendingAdds: [
          { artistId: 7, pseudonymId: 32, role: 'Voz', active: true }
        ]
      }
    )

    expect(result.success).toBe(true)
    expect(writes.some((write) =>
      JSON.stringify(write.update) ===
      JSON.stringify({ pseudonimoId: 32, activo: true, rol: 'Voz' })
    )).toBe(true)
    expect(writes.some((write) => write.values !== undefined)).toBe(false)
  })

  test('updates a pending member with the selected alias', async () => {
    selectResults.push([{ id: 33 }])

    const result = await upsertCollectiveWithMembersAction(
      { success: false },
      {
        ...basePayload,
        pendingUpdates: [
          { artistId: 7, pseudonymId: 33, role: 'Bajo', active: false }
        ]
      }
    )

    expect(result.success).toBe(true)
    expect(writes.some((write) =>
      JSON.stringify(write.update) ===
      JSON.stringify({ pseudonimoId: 33, rol: 'Bajo', activo: false })
    )).toBe(true)
  })

  test('reports requested SWR policy for mixed changes and immediately invalidates festivals when the name changes', async () => {
    const result = await upsertCollectiveWithMembersAction(
      { success: false },
      {
        ...basePayload,
        fields: { ...basePayload.fields, nombre: 'New Collective' }
      }
    )

    expect(result.success).toBe(true)
    expect(result.webRevalidation).toBe('swr')
    expect(webInvalidationBatches).toEqual([
      {
        requests: [
          {
            tag: 'festivales:critico',
            mode: 'immediate'
          },
          { tag: 'catalogo:artistas:base' },
          { tag: 'catalogo:artistas:participaciones' },
          { tag: 'catalogo:artistas' }
        ],
        context: 'upsert-collective-with-members'
      }
    ])
  })

  test('does not invalidate festivals when unchanged name accompanies a description update', async () => {
    const result = await upsertCollectiveWithMembersAction(
      { success: false },
      {
        ...basePayload,
        fields: { ...basePayload.fields, descripcion: 'Updated description' }
      }
    )

    expect(result.success).toBe(true)
    expect(result.webRevalidation).toBeUndefined()
    expect(webInvalidationBatches).toEqual([])
  })

  test('does not invalidate festivals when the transaction fails after a name change', async () => {
    transactionFailure = new Error('Transaction failed')

    const result = await upsertCollectiveWithMembersAction(
      { success: false },
      {
        ...basePayload,
        fields: { ...basePayload.fields, nombre: 'New Collective' }
      }
    )

    expect(result.success).toBe(false)
    expect(result.webRevalidation).toBeUndefined()
    expect(webInvalidationBatches).toEqual([])
  })

  test('does not invalidate the catalog for a non-catalog field-only update', async () => {
    const result = await upsertCollectiveWithMembersAction(
      { success: false },
      {
        ...basePayload,
        fields: { ...basePayload.fields, descripcion: 'Updated description' }
      }
    )

    expect(result.success).toBe(true)
    expect(result.webRevalidation).toBeUndefined()
    expect(webInvalidationBatches).toEqual([])
  })

  test('rejects an inactive alias', async () => {
    selectResults.push([])

    const result = await upsertCollectiveWithMembersAction(
      { success: false },
      {
        ...basePayload,
        pendingAdds: [
          { artistId: 7, pseudonymId: 31, role: null, active: true }
        ]
      }
    )

    expect(result.success).toBe(false)
    expect(result.errors?.[0]?.message).toContain('no pertenece al artista')
    expect(writes.some((write) => write.values !== undefined)).toBe(false)
  })

  test('rejects an alias owned by another artist', async () => {
    selectResults.push([])

    const result = await upsertCollectiveWithMembersAction(
      { success: false },
      {
        ...basePayload,
        pendingAdds: [
          { artistId: 7, pseudonymId: 31, role: null, active: true }
        ]
      }
    )

    expect(result.success).toBe(false)
    expect(result.errors?.[0]?.message).toContain('no pertenece al artista')
    expect(writes.some((write) => write.values !== undefined)).toBe(false)
  })

  test('rejects a new member without a pseudonym ID', async () => {
    const result = await upsertCollectiveWithMembersAction(
      { success: false },
      {
        ...basePayload,
        pendingAdds: [
          { artistId: 7, pseudonymId: null, role: null, active: true }
        ]
      }
    )

    expect(result.success).toBe(false)
    expect(writes).toEqual([])
  })

  test('rejects an update without a pseudonym ID', async () => {
    const result = await upsertCollectiveWithMembersAction(
      { success: false },
      {
        ...basePayload,
        pendingUpdates: [
          { artistId: 7, pseudonymId: null, role: null, active: true }
        ]
      }
    )

    expect(result.success).toBe(false)
    expect(writes).toEqual([])
  })
})
