import { describe, test, expect } from 'bun:test'
import { mapToCatalogoArtistaInput } from '../catalogo.mapper'
import type { JournalEntry } from '@/shared/change-journal/lib/types'

describe('mapToCatalogoArtistaInput', () => {
  const baseEntry: JournalEntry = {
    entryId: 'entry-123',
    schemaVersion: 1,
    section: 'catalogo',
    scopeKey: 'catalogo:1:artistaId',
    payload: { op: 'set', value: {} },
    timestampMs: Date.now(),
    clientId: 'client-456',
    sessionId: 'session-789'
  }

  test('maps valid entry with minimal required fields', () => {
    const entry: JournalEntry = {
      ...baseEntry,
      payload: {
        op: 'set',
        value: {
          artistaId: 1,
          orden: '001'
        }
      }
    }

    const result = mapToCatalogoArtistaInput(entry)

    expect(result).toEqual({
      artistaId: 1,
      orden: '001',
      destacado: false,
      activo: true
    })
  })

  test('maps valid entry with all fields', () => {
    const entry: JournalEntry = {
      ...baseEntry,
      payload: {
        op: 'set',
        value: {
          id: 5,
          artistaId: 10,
          orden: '042',
          destacado: true,
          activo: false,
          descripcion: 'Artista destacado del catálogo'
        }
      }
    }

    const result = mapToCatalogoArtistaInput(entry)

    expect(result).toEqual({
      id: 5,
      artistaId: 10,
      orden: '042',
      destacado: true,
      activo: false,
      descripcion: 'Artista destacado del catálogo'
    })
  })

  test('throws error for unset operation', () => {
    const entry: JournalEntry = {
      ...baseEntry,
      payload: { op: 'unset' }
    }

    expect(() => mapToCatalogoArtistaInput(entry)).toThrow(
      'Cannot map unset operation to CatalogoArtistaInput'
    )
  })

  test('throws ZodError for invalid artistaId (zero)', () => {
    const entry: JournalEntry = {
      ...baseEntry,
      payload: {
        op: 'set',
        value: {
          artistaId: 0,
          orden: '001'
        }
      }
    }

    expect(() => mapToCatalogoArtistaInput(entry)).toThrow()
  })

  test('throws ZodError for missing artistaId', () => {
    const entry: JournalEntry = {
      ...baseEntry,
      payload: {
        op: 'set',
        value: {
          orden: '001'
        }
      }
    }

    expect(() => mapToCatalogoArtistaInput(entry)).toThrow()
  })

  test('throws ZodError for empty orden', () => {
    const entry: JournalEntry = {
      ...baseEntry,
      payload: {
        op: 'set',
        value: {
          artistaId: 1,
          orden: ''
        }
      }
    }

    expect(() => mapToCatalogoArtistaInput(entry)).toThrow()
  })

  test('throws ZodError for invalid destacado type', () => {
    const entry: JournalEntry = {
      ...baseEntry,
      payload: {
        op: 'set',
        value: {
          artistaId: 1,
          orden: '001',
          destacado: 'true'
        }
      }
    }

    expect(() => mapToCatalogoArtistaInput(entry)).toThrow()
  })

  test('throws ZodError for invalid activo type', () => {
    const entry: JournalEntry = {
      ...baseEntry,
      payload: {
        op: 'set',
        value: {
          artistaId: 1,
          orden: '001',
          activo: 1
        }
      }
    }

    expect(() => mapToCatalogoArtistaInput(entry)).toThrow()
  })

  test('allows optional descripcion', () => {
    const entry: JournalEntry = {
      ...baseEntry,
      payload: {
        op: 'set',
        value: {
          artistaId: 1,
          orden: '001',
          descripcion: undefined
        }
      }
    }

    const result = mapToCatalogoArtistaInput(entry)

    expect(result.descripcion).toBeUndefined()
  })

  test('validates patch operation', () => {
    const entry: JournalEntry = {
      ...baseEntry,
      payload: {
        op: 'patch',
        value: {
          artistaId: 1,
          orden: '001'
        }
      }
    }

    const result = mapToCatalogoArtistaInput(entry)

    expect(result).toEqual({
      artistaId: 1,
      orden: '001',
      destacado: false,
      activo: true
    })
  })
})
