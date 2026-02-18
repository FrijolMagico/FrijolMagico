import type { JournalEntry } from '@/shared/change-journal/lib/types'
import {
  mapToEventoEdicionDiaInput,
  mapToEventoEdicionInput,
  mapToEventoInput
} from '@/shared/commit-system/mappers/evento.mapper'
import { describe, expect, test } from 'bun:test'
import { ZodError } from 'zod'

function createMockEntry(
  section: string,
  value: unknown,
  op: 'set' | 'unset' | 'patch' = 'set'
): JournalEntry {
  return {
    entryId: crypto.randomUUID(),
    schemaVersion: 1,
    section,
    scopeKey: `${section}:test:field`,
    payload: op === 'unset' ? { op: 'unset' } : { op, value },
    timestampMs: Date.now(),
    clientId: crypto.randomUUID(),
    sessionId: crypto.randomUUID()
  }
}

describe('evento.mapper', () => {
  describe('mapToEventoInput()', () => {
    test('validates and returns correct EventoInput', () => {
      const entry = createMockEntry('evento', {
        nombre: 'Festival de Jazz',
        organizacionId: 1
      })

      const result = mapToEventoInput(entry)

      expect(result).toEqual({
        nombre: 'Festival de Jazz',
        organizacionId: 1
      })
    })

    test('accepts optional fields', () => {
      const entry = createMockEntry('evento', {
        id: 42,
        organizacionId: 1,
        nombre: 'Festival de Rock',
        slug: 'festival-de-rock',
        descripcion: 'Un gran festival'
      })

      const result = mapToEventoInput(entry)

      expect(result.id).toBe(42)
      expect(result.slug).toBe('festival-de-rock')
      expect(result.descripcion).toBe('Un gran festival')
    })

    test('throws error for unset operation', () => {
      const entry = createMockEntry('evento', null, 'unset')

      expect(() => mapToEventoInput(entry)).toThrow(
        'Cannot map unset operation to EventoInput'
      )
    })

    test('throws ZodError for missing required nombre', () => {
      const entry = createMockEntry('evento', {
        organizacionId: 1
      })

      expect(() => mapToEventoInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError for empty nombre', () => {
      const entry = createMockEntry('evento', {
        nombre: '',
        organizacionId: 1
      })

      expect(() => mapToEventoInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError for invalid id type', () => {
      const entry = createMockEntry('evento', {
        id: 'invalid',
        nombre: 'Festival',
        organizacionId: 1
      })

      expect(() => mapToEventoInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError for negative id', () => {
      const entry = createMockEntry('evento', {
        id: -1,
        nombre: 'Festival',
        organizacionId: 1
      })

      expect(() => mapToEventoInput(entry)).toThrow(ZodError)
    })
  })

  describe('mapToEventoEdicionInput()', () => {
    test('validates and returns correct EventoEdicionInput', () => {
      const entry = createMockEntry('evento-edicion', {
        eventoId: 1,
        numeroEdicion: '2024'
      })

      const result = mapToEventoEdicionInput(entry)

      expect(result).toEqual({
        eventoId: 1,
        numeroEdicion: '2024'
      })
    })

    test('accepts all optional fields', () => {
      const entry = createMockEntry('evento-edicion', {
        id: 10,
        eventoId: 1,
        nombre: 'Edición Especial',
        numeroEdicion: '2024',
        slug: 'edicion-especial-2024',
        posterUrl: 'https://example.com/poster.jpg'
      })

      const result = mapToEventoEdicionInput(entry)

      expect(result.id).toBe(10)
      expect(result.nombre).toBe('Edición Especial')
      expect(result.slug).toBe('edicion-especial-2024')
      expect(result.posterUrl).toBe('https://example.com/poster.jpg')
    })

    test('throws error for unset operation', () => {
      const entry = createMockEntry('evento-edicion', null, 'unset')

      expect(() => mapToEventoEdicionInput(entry)).toThrow(
        'Cannot map unset operation to EventoEdicionInput'
      )
    })

    test('throws ZodError for missing required numeroEdicion', () => {
      const entry = createMockEntry('evento-edicion', {
        eventoId: 1
      })

      expect(() => mapToEventoEdicionInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError for empty numeroEdicion', () => {
      const entry = createMockEntry('evento-edicion', {
        eventoId: 1,
        numeroEdicion: ''
      })

      expect(() => mapToEventoEdicionInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError for invalid eventoId', () => {
      const entry = createMockEntry('evento-edicion', {
        eventoId: -1,
        numeroEdicion: '2024'
      })

      expect(() => mapToEventoEdicionInput(entry)).toThrow(ZodError)
    })
  })

  describe('mapToEventoEdicionDiaInput()', () => {
    test('validates and returns correct EventoEdicionDiaInput', () => {
      const entry = createMockEntry('evento-edicion-dia', {
        eventoEdicionId: 5,
        fecha: '2024-12-15',
        horaInicio: '18:00',
        horaFin: '23:00',
        modalidad: 'presencial'
      })

      const result = mapToEventoEdicionDiaInput(entry)

      expect(result.eventoEdicionId).toBe(5)
      expect(result.fecha).toBe('2024-12-15')
      expect(result.horaInicio).toBe('18:00')
      expect(result.horaFin).toBe('23:00')
      expect(result.modalidad).toBe('presencial')
    })

    test('uses default modalidad if not provided', () => {
      const entry = createMockEntry('evento-edicion-dia', {
        eventoEdicionId: 5,
        fecha: '2024-12-15',
        horaInicio: '18:00',
        horaFin: '23:00'
      })

      const result = mapToEventoEdicionDiaInput(entry)

      expect(result.modalidad).toBe('presencial')
    })

    test('accepts optional fields', () => {
      const entry = createMockEntry('evento-edicion-dia', {
        id: 99,
        eventoEdicionId: 5,
        lugarId: 3,
        fecha: '2024-12-15',
        horaInicio: '18:00',
        horaFin: '23:00',
        modalidad: 'hibrido'
      })

      const result = mapToEventoEdicionDiaInput(entry)

      expect(result.id).toBe(99)
      expect(result.lugarId).toBe(3)
      expect(result.modalidad).toBe('hibrido')
    })

    test('accepts all valid modalidad values', () => {
      const modalidades = ['presencial', 'online', 'hibrido'] as const

      modalidades.forEach((modalidad) => {
        const entry = createMockEntry('evento-edicion-dia', {
          eventoEdicionId: 5,
          fecha: '2024-12-15',
          horaInicio: '18:00',
          horaFin: '23:00',
          modalidad
        })

        const result = mapToEventoEdicionDiaInput(entry)
        expect(result.modalidad).toBe(modalidad)
      })
    })

    test('throws error for unset operation', () => {
      const entry = createMockEntry('evento-edicion-dia', null, 'unset')

      expect(() => mapToEventoEdicionDiaInput(entry)).toThrow(
        'Cannot map unset operation to EventoEdicionDiaInput'
      )
    })

    test('throws ZodError for missing required eventoEdicionId', () => {
      const entry = createMockEntry('evento-edicion-dia', {
        fecha: '2024-12-15',
        horaInicio: '18:00',
        horaFin: '23:00'
      })

      expect(() => mapToEventoEdicionDiaInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError for invalid eventoEdicionId', () => {
      const entry = createMockEntry('evento-edicion-dia', {
        eventoEdicionId: 0,
        fecha: '2024-12-15',
        horaInicio: '18:00',
        horaFin: '23:00'
      })

      expect(() => mapToEventoEdicionDiaInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError for missing required fecha', () => {
      const entry = createMockEntry('evento-edicion-dia', {
        eventoEdicionId: 5,
        horaInicio: '18:00',
        horaFin: '23:00'
      })

      expect(() => mapToEventoEdicionDiaInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError for empty fecha', () => {
      const entry = createMockEntry('evento-edicion-dia', {
        eventoEdicionId: 5,
        fecha: '',
        horaInicio: '18:00',
        horaFin: '23:00'
      })

      expect(() => mapToEventoEdicionDiaInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError for missing required horaInicio', () => {
      const entry = createMockEntry('evento-edicion-dia', {
        eventoEdicionId: 5,
        fecha: '2024-12-15',
        horaFin: '23:00'
      })

      expect(() => mapToEventoEdicionDiaInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError for missing required horaFin', () => {
      const entry = createMockEntry('evento-edicion-dia', {
        eventoEdicionId: 5,
        fecha: '2024-12-15',
        horaInicio: '18:00'
      })

      expect(() => mapToEventoEdicionDiaInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError for invalid modalidad', () => {
      const entry = createMockEntry('evento-edicion-dia', {
        eventoEdicionId: 5,
        fecha: '2024-12-15',
        horaInicio: '18:00',
        horaFin: '23:00',
        modalidad: 'invalid'
      })

      expect(() => mapToEventoEdicionDiaInput(entry)).toThrow(ZodError)
    })
  })
})
