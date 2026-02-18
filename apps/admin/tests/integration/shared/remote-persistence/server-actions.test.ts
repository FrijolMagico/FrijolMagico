import { describe, test, expect, mock } from 'bun:test'
import type { JournalEntry } from '@/shared/change-journal/lib/types'

const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@frijolmagico.cl',
    name: 'Test User'
  },
  session: {
    id: 'test-session-id',
    userId: 'test-user-id',
    expiresAt: new Date(Date.now() + 86400000)
  }
}

function createEntry(
  section: string,
  scopeKey: string,
  op: 'set' | 'patch' | 'unset',
  value?: unknown
): JournalEntry {
  return {
    entryId: crypto.randomUUID(),
    schemaVersion: 1,
    section,
    scopeKey,
    payload: op === 'unset' ? { op: 'unset' } : { op, value },
    timestampMs: Date.now(),
    clientId: crypto.randomUUID()
  }
}

mock.module('next/cache', () => ({
  revalidateTag: mock(() => {})
}))

describe('saveOrganizacion', () => {
  test('returns success with no entries', async () => {
    mock.module('@/shared/commit-system/lib/journal-reader', () => ({
      getLatestEntries: mock(() => Promise.resolve([]))
    }))

    mock.module('@/lib/auth/utils', () => ({
      requireAuth: mock(() => Promise.resolve(mockSession))
    }))

    const { saveOrganizacion } =
      await import('@/shared/commit-system/actions/save-organizacion.action')
    const result = await saveOrganizacion('organizacion')

    expect(result.success).toBe(true)
    expect(result.processedCount).toBe(0)
  })

  test('detects contradictory operations', async () => {
    const entries = [
      createEntry('organizacion', 'organizacion:1', 'unset'),
      createEntry('organizacion', 'organizacion:1:nombre', 'patch', {
        nombre: 'Updated'
      })
    ]

    mock.module('@/shared/commit-system/lib/journal-reader', () => ({
      getLatestEntries: mock(() => Promise.resolve(entries))
    }))

    mock.module('@/lib/auth/utils', () => ({
      requireAuth: mock(() => Promise.resolve(mockSession))
    }))

    const { saveOrganizacion } =
      await import('@/shared/commit-system/actions/save-organizacion.action')
    const result = await saveOrganizacion('organizacion')

    expect(result.success).toBe(false)
    expect(result.errorCode).toBe('VALIDATION_ERROR')
  })
})

describe('saveCatalogo', () => {
  test('rejects invalid section', async () => {
    const { saveCatalogo } =
      await import('@/app/(authenticated)/(admin)/artistas/catalogo/_actions/save-catalogo.action')
    // @ts-expect-error Testing invalid input
    const result = await saveCatalogo('invalid')

    expect(result.success).toBe(false)
    expect(result.errorCode).toBe('VALIDATION_ERROR')
  })

  test('returns success with no entries', async () => {
    mock.module('@/shared/commit-system/lib/journal-reader', () => ({
      getLatestEntries: mock(() => Promise.resolve([]))
    }))

    const { saveCatalogo } =
      await import('@/app/(authenticated)/(admin)/artistas/catalogo/_actions/save-catalogo.action')
    const result = await saveCatalogo('catalogo')

    expect(result.success).toBe(true)
    expect(result.processedCount).toBe(0)
  })

  test('processes mixed operations with sorting', async () => {
    const entries = [
      createEntry('catalogo', 'catalogo-artista:2', 'patch', {
        id: 2,
        artistaId: 1,
        orden: 'a0'
      }),
      createEntry('catalogo', 'catalogo-artista:3', 'unset'),
      createEntry('catalogo', 'catalogo-artista:temp-1', 'set', {
        artistaId: 1,
        orden: 'a1'
      })
    ]

    const mockClearSection = mock(() => Promise.resolve())

    mock.module('@/shared/commit-system/lib/journal-reader', () => ({
      getLatestEntries: mock(() => Promise.resolve(entries))
    }))

    mock.module('@/shared/change-journal/change-journal', () => ({
      clearSection: mockClearSection
    }))

    mock.module('@frijolmagico/database/orm', () => ({
      db: {
        transaction: mock(async (cb: (tx: unknown) => Promise<unknown>) => {
          const mockTx = {
            delete: mock(() => ({ where: mock(() => Promise.resolve()) })),
            update: mock(() => ({
              set: mock(() => ({ where: mock(() => Promise.resolve()) }))
            })),
            insert: mock(() => ({
              values: mock(() => ({
                returning: mock(() => Promise.resolve([{ id: 100 }]))
              }))
            }))
          }
          return cb(mockTx)
        })
      }
    }))

    mock.module('@frijolmagico/database/schema', () => ({
      artist: { catalogoArtista: {} }
    }))

    const { saveCatalogo } =
      await import('@/app/(authenticated)/(admin)/artistas/catalogo/_actions/save-catalogo.action')
    const result = await saveCatalogo('catalogo')

    expect(result.success).toBe(true)
    expect(result.processedCount).toBe(3)
    expect(mockClearSection).toHaveBeenCalled()
  })
})

describe('saveArtista', () => {
  test('rejects batches over 50 entries', async () => {
    const entries = Array.from({ length: 51 }, (_, i) =>
      createEntry('artista', `artista:${i}`, 'set', {
        nombre: `A${i}`,
        pseudonimo: `a${i}`,
        slug: `a${i}`
      })
    )

    mock.module('@/shared/commit-system/lib/journal-reader', () => ({
      getLatestEntries: mock(() => Promise.resolve(entries))
    }))

    const { saveArtista } =
      await import('@/shared/commit-system/actions/save-artista.action')
    const result = await saveArtista('artista')

    expect(result.success).toBe(false)
    expect(result.errorCode).toBe('VALIDATION_ERROR')
  })

  test('processes artista with temp ID resolution', async () => {
    const entries = [
      createEntry('artista', 'artista:temp-1', 'set', {
        nombre: 'Real',
        pseudonimo: 'Stage',
        slug: 'stage',
        estadoId: 1
      }),
      createEntry('artista', 'artistaImagen:temp-img-1', 'set', {
        artistaId: 999,
        imagenUrl: 'https://example.com/img.jpg',
        tipo: 'avatar',
        orden: 1
      })
    ]

    const mockClearSection = mock(() => Promise.resolve())

    mock.module('@/shared/commit-system/lib/journal-reader', () => ({
      getLatestEntries: mock(() => Promise.resolve(entries))
    }))

    mock.module('@/shared/change-journal/change-journal', () => ({
      clearSection: mockClearSection
    }))

    let count = 0
    mock.module('@frijolmagico/database/orm', () => ({
      db: {
        transaction: mock(async (cb: (tx: unknown) => Promise<unknown>) => {
          const mockTx = {
            insert: mock(() => ({
              values: mock(() => ({
                returning: mock(() => {
                  count++
                  return Promise.resolve([{ id: count * 100 }])
                })
              }))
            })),
            update: mock(() => ({
              set: mock(() => ({ where: mock(() => Promise.resolve()) }))
            })),
            delete: mock(() => ({ where: mock(() => Promise.resolve()) }))
          }
          return cb(mockTx)
        })
      }
    }))

    mock.module('@frijolmagico/database/schema', () => ({
      artist: { artista: {}, artistaImagen: {} }
    }))

    const { saveArtista } =
      await import('@/shared/commit-system/actions/save-artista.action')
    const result = await saveArtista('artista')

    expect(result.success).toBe(true)
    expect(mockClearSection).toHaveBeenCalled()
  })
})

describe('saveEvento', () => {
  test('rejects invalid section', async () => {
    const { saveEvento } =
      await import('@/shared/commit-system/actions/save-evento.action')
    // @ts-expect-error Testing invalid input
    const result = await saveEvento('invalid')

    expect(result.success).toBe(false)
    expect(result.errorCode).toBe('VALIDATION_ERROR')
  })

  test('processes hierarchical evento structure', async () => {
    const entries = [
      createEntry('evento', 'evento:temp-1', 'set', {
        nombre: 'Festival',
        organizacionId: 1
      }),
      createEntry('evento', 'evento-edicion:temp-2', 'set', {
        eventoId: 100,
        numeroEdicion: '1'
      }),
      createEntry('evento', 'evento-edicion-dia:temp-3', 'set', {
        eventoEdicionId: 200,
        fecha: '2024-12-01',
        horaInicio: '18:00',
        horaFin: '23:00'
      })
    ]

    const mockClearSection = mock(() => Promise.resolve())

    mock.module('@/shared/commit-system/lib/journal-reader', () => ({
      getLatestEntries: mock(() => Promise.resolve(entries))
    }))

    mock.module('@/shared/change-journal/change-journal', () => ({
      clearSection: mockClearSection
    }))

    let count = 0
    mock.module('@frijolmagico/database/orm', () => ({
      db: {
        transaction: mock(async (cb: (tx: unknown) => Promise<unknown>) => {
          const mockTx = {
            insert: mock(() => ({
              values: mock(() => ({
                returning: mock(() => {
                  count++
                  return Promise.resolve([{ id: count * 100 }])
                })
              }))
            })),
            update: mock(() => ({
              set: mock(() => ({ where: mock(() => Promise.resolve()) }))
            })),
            delete: mock(() => ({ where: mock(() => Promise.resolve()) }))
          }
          return cb(mockTx)
        })
      }
    }))

    mock.module('@frijolmagico/database/schema', () => ({
      events: { evento: {}, eventoEdicion: {}, eventoEdicionDia: {} }
    }))

    const { saveEvento } =
      await import('@/shared/commit-system/actions/save-evento.action')
    const result = await saveEvento('evento')

    expect(result.success).toBe(true)
    expect(mockClearSection).toHaveBeenCalled()
  })
})

describe('Error Handling', () => {
  test('does not clear journal on transaction failure', async () => {
    const entries = [
      createEntry('catalogo', 'catalogo-artista:1', 'set', {
        artistaId: 1,
        orden: 'a0'
      })
    ]

    const mockClearSection = mock(() => Promise.resolve())

    mock.module('@/shared/commit-system/lib/journal-reader', () => ({
      getLatestEntries: mock(() => Promise.resolve(entries))
    }))

    mock.module('@/shared/change-journal/change-journal', () => ({
      clearSection: mockClearSection
    }))

    mock.module('@frijolmagico/database/orm', () => ({
      db: {
        transaction: mock(async () => {
          throw new Error('Transaction failed')
        })
      }
    }))

    mock.module('@frijolmagico/database/schema', () => ({
      artist: { catalogoArtista: {} }
    }))

    const { saveCatalogo } =
      await import('@/app/(authenticated)/(admin)/artistas/catalogo/_actions/save-catalogo.action')
    const result = await saveCatalogo('catalogo')

    expect(result.success).toBe(false)
    expect(mockClearSection).not.toHaveBeenCalled()
  })

  test('handles validation errors', async () => {
    const entries = [
      createEntry('organizacion', 'organizacion:1', 'set', { nombre: '' })
    ]

    const mockClearSection = mock(() => Promise.resolve())

    mock.module('@/shared/commit-system/lib/journal-reader', () => ({
      getLatestEntries: mock(() => Promise.resolve(entries))
    }))

    mock.module('@/lib/auth/utils', () => ({
      requireAuth: mock(() => Promise.resolve(mockSession))
    }))

    mock.module('@/shared/change-journal/change-journal', () => ({
      clearSection: mockClearSection
    }))

    const { saveOrganizacion } =
      await import('@/shared/commit-system/actions/save-organizacion.action')
    const result = await saveOrganizacion('organizacion')

    expect(result.success).toBe(false)
    expect(mockClearSection).not.toHaveBeenCalled()
  })
})
