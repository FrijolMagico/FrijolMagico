/**
 * @fileoverview mappers.test.ts - Unit Tests for Remote Persistence Mappers
 *
 * Tests all mapper functions (T11-T14) to ensure correct transformation
 * of JournalEntry payloads to typed DB inputs.
 *
 * Test coverage:
 * - Valid payload transformation (happy path)
 * - Optional field handling
 * - Rejection of 'unset' operations
 * - Zod validation error propagation
 * - Schema compliance for all entity types
 *
 * @connection _mappers/*.mapper.ts - Mapper implementations
 * @connection _schemas/*.schema.ts - Zod validation schemas
 */

import type { JournalEntry } from '@/shared/change-journal/lib/types'
import {
  mapToArtistaImagenInput,
  mapToArtistaInput,
  mapToCatalogoArtistaInput as mapToCatalogoArtistaInputFromArtista
} from '@/shared/commit-system/mappers/artista.mapper'
import { mapToCatalogoArtistaInput } from '@/shared/commit-system/mappers/catalogo.mapper'
import {
  mapToEventoEdicionDiaInput,
  mapToEventoEdicionInput,
  mapToEventoInput
} from '@/shared/commit-system/mappers/evento.mapper'
import {
  mapToOrganizacionEquipoInput,
  mapToOrganizacionInput
} from '@/shared/commit-system/mappers/organizacion.mapper'
import { describe, expect, test } from 'bun:test'
import { ZodError } from 'zod'

/**
 * Helper to create mock JournalEntry
 */
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

describe('Artista Mappers', () => {
  describe('mapToArtistaInput()', () => {
    test('validates and returns correct ArtistaInput with required fields', () => {
      const entry = createMockEntry('artista', {
        pseudonimo: 'DJ Shadow',
        slug: 'dj-shadow'
      })

      const result = mapToArtistaInput(entry)

      expect(result).toMatchObject({
        pseudonimo: 'DJ Shadow',
        slug: 'dj-shadow',
        estadoId: 1 // Default value
      })
    })

    test('accepts all optional fields', () => {
      const entry = createMockEntry('artista', {
        id: 42,
        estadoId: 2,
        nombre: 'Roberto Silva',
        pseudonimo: 'DJ Shadow',
        slug: 'dj-shadow',
        rut: '12345678-9',
        correo: 'dj@example.com',
        rrss: '@djshadow',
        ciudad: 'Santiago',
        pais: 'Chile'
      })

      const result = mapToArtistaInput(entry)

      expect(result).toEqual({
        id: 42,
        estadoId: 2,
        nombre: 'Roberto Silva',
        pseudonimo: 'DJ Shadow',
        slug: 'dj-shadow',
        rut: '12345678-9',
        correo: 'dj@example.com',
        rrss: '@djshadow',
        ciudad: 'Santiago',
        pais: 'Chile'
      })
    })

    test('throws error on unset operation', () => {
      const entry = createMockEntry('artista', undefined, 'unset')

      expect(() => mapToArtistaInput(entry)).toThrow(
        'Cannot map unset operation to ArtistaInput'
      )
    })

    test('throws ZodError on missing required fields', () => {
      const entry = createMockEntry('artista', {
        nombre: 'Roberto Silva'
        // Missing pseudonimo and slug
      })

      expect(() => mapToArtistaInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError on invalid field types', () => {
      const entry = createMockEntry('artista', {
        pseudonimo: 'DJ Shadow',
        slug: 'dj-shadow',
        estadoId: 'invalid' // Should be number
      })

      expect(() => mapToArtistaInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError on empty required strings', () => {
      const entry = createMockEntry('artista', {
        pseudonimo: '', // Empty string not allowed
        slug: 'dj-shadow'
      })

      expect(() => mapToArtistaInput(entry)).toThrow(ZodError)
    })
  })

  describe('mapToArtistaImagenInput()', () => {
    test('validates and returns correct ArtistaImagenInput', () => {
      const entry = createMockEntry('artista-imagen', {
        artistaId: 1,
        imagenUrl: 'https://example.com/avatar.jpg',
        tipo: 'avatar'
      })

      const result = mapToArtistaImagenInput(entry)

      expect(result).toMatchObject({
        artistaId: 1,
        imagenUrl: 'https://example.com/avatar.jpg',
        tipo: 'avatar',
        orden: 1 // Default value
      })
    })

    test('accepts galeria tipo', () => {
      const entry = createMockEntry('artista-imagen', {
        artistaId: 1,
        imagenUrl: 'https://example.com/gallery1.jpg',
        tipo: 'galeria',
        orden: 5,
        metadata: '{"alt":"Concert photo"}'
      })

      const result = mapToArtistaImagenInput(entry)

      expect(result).toEqual({
        artistaId: 1,
        imagenUrl: 'https://example.com/gallery1.jpg',
        tipo: 'galeria',
        orden: 5,
        metadata: '{"alt":"Concert photo"}'
      })
    })

    test('throws error on unset operation', () => {
      const entry = createMockEntry('artista-imagen', undefined, 'unset')

      expect(() => mapToArtistaImagenInput(entry)).toThrow(
        'Cannot map unset operation to ArtistaImagenInput'
      )
    })

    test('throws ZodError on invalid tipo enum', () => {
      const entry = createMockEntry('artista-imagen', {
        artistaId: 1,
        imagenUrl: 'https://example.com/avatar.jpg',
        tipo: 'invalid' // Not 'avatar' or 'galeria'
      })

      expect(() => mapToArtistaImagenInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError on missing required fields', () => {
      const entry = createMockEntry('artista-imagen', {
        artistaId: 1
        // Missing imagenUrl and tipo
      })

      expect(() => mapToArtistaImagenInput(entry)).toThrow(ZodError)
    })
  })

  describe('mapToCatalogoArtistaInput() [artista.mapper]', () => {
    test('validates and returns correct CatalogoArtistaInput', () => {
      const entry = createMockEntry('catalogo-artista', {
        artistaId: 1,
        orden: '001'
      })

      const result = mapToCatalogoArtistaInputFromArtista(entry)

      expect(result).toMatchObject({
        artistaId: 1,
        orden: '001',
        destacado: false, // Default value
        activo: true // Default value
      })
    })

    test('accepts all optional fields', () => {
      const entry = createMockEntry('catalogo-artista', {
        id: 10,
        artistaId: 5,
        orden: '042',
        destacado: true,
        activo: false,
        descripcion: 'Featured artist'
      })

      const result = mapToCatalogoArtistaInputFromArtista(entry)

      expect(result).toEqual({
        id: 10,
        artistaId: 5,
        orden: '042',
        destacado: true,
        activo: false,
        descripcion: 'Featured artist'
      })
    })

    test('throws error on unset operation', () => {
      const entry = createMockEntry('catalogo-artista', undefined, 'unset')

      expect(() => mapToCatalogoArtistaInputFromArtista(entry)).toThrow(
        'Cannot map unset operation to CatalogoArtistaInput'
      )
    })

    test('throws ZodError on missing required fields', () => {
      const entry = createMockEntry('catalogo-artista', {
        orden: '001'
        // Missing artistaId
      })

      expect(() => mapToCatalogoArtistaInputFromArtista(entry)).toThrow(
        ZodError
      )
    })
  })
})

describe('Catalogo Mappers', () => {
  describe('mapToCatalogoArtistaInput()', () => {
    test('validates and returns correct CatalogoArtistaInput', () => {
      const entry = createMockEntry('catalogo', {
        artistaId: 2,
        orden: '010',
        destacado: true,
        activo: true
      })

      const result = mapToCatalogoArtistaInput(entry)

      expect(result).toEqual({
        artistaId: 2,
        orden: '010',
        destacado: true,
        activo: true
      })
    })

    test('applies default values for boolean fields', () => {
      const entry = createMockEntry('catalogo', {
        artistaId: 3,
        orden: '020'
      })

      const result = mapToCatalogoArtistaInput(entry)

      expect(result).toMatchObject({
        artistaId: 3,
        orden: '020',
        destacado: false, // Default
        activo: true // Default
      })
    })

    test('throws error with descriptive message on unset operation', () => {
      const entry = createMockEntry('catalogo', undefined, 'unset')

      expect(() => mapToCatalogoArtistaInput(entry)).toThrow(
        'Cannot map unset operation to CatalogoArtistaInput. Use delete operations instead.'
      )
    })

    test('throws ZodError on invalid artistaId', () => {
      const entry = createMockEntry('catalogo', {
        artistaId: -1, // Negative number
        orden: '001'
      })

      expect(() => mapToCatalogoArtistaInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError on empty orden string', () => {
      const entry = createMockEntry('catalogo', {
        artistaId: 1,
        orden: '' // Empty string not allowed
      })

      expect(() => mapToCatalogoArtistaInput(entry)).toThrow(ZodError)
    })
  })
})

describe('Evento Mappers', () => {
  describe('mapToEventoInput()', () => {
    test('validates and returns correct EventoInput with required fields', () => {
      const entry = createMockEntry('evento', {
        nombre: 'Festival de Jazz 2024'
      })

      const result = mapToEventoInput(entry)

      expect(result).toEqual({
        nombre: 'Festival de Jazz 2024'
      })
    })

    test('accepts all optional fields', () => {
      const entry = createMockEntry('evento', {
        id: 100,
        organizacionId: 5,
        nombre: 'Festival de Rock',
        slug: 'festival-de-rock',
        descripcion: 'El mejor festival del año'
      })

      const result = mapToEventoInput(entry)

      expect(result).toEqual({
        id: 100,
        organizacionId: 5,
        nombre: 'Festival de Rock',
        slug: 'festival-de-rock',
        descripcion: 'El mejor festival del año'
      })
    })

    test('throws error on unset operation', () => {
      const entry = createMockEntry('evento', undefined, 'unset')

      expect(() => mapToEventoInput(entry)).toThrow(
        'Cannot map unset operation to EventoInput'
      )
    })

    test('throws ZodError on missing nombre', () => {
      const entry = createMockEntry('evento', {
        slug: 'test'
      })

      expect(() => mapToEventoInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError on empty nombre', () => {
      const entry = createMockEntry('evento', {
        nombre: '' // Empty string not allowed
      })

      expect(() => mapToEventoInput(entry)).toThrow(ZodError)
    })
  })

  describe('mapToEventoEdicionInput()', () => {
    test('validates and returns correct EventoEdicionInput', () => {
      const entry = createMockEntry('evento-edicion', {
        numeroEdicion: '2024'
      })

      const result = mapToEventoEdicionInput(entry)

      expect(result).toEqual({
        numeroEdicion: '2024'
      })
    })

    test('accepts all optional fields', () => {
      const entry = createMockEntry('evento-edicion', {
        id: 50,
        eventoId: 10,
        nombre: 'Edición Especial',
        numeroEdicion: '10',
        slug: 'edicion-especial',
        posterUrl: 'https://example.com/poster.jpg'
      })

      const result = mapToEventoEdicionInput(entry)

      expect(result).toEqual({
        id: 50,
        eventoId: 10,
        nombre: 'Edición Especial',
        numeroEdicion: '10',
        slug: 'edicion-especial',
        posterUrl: 'https://example.com/poster.jpg'
      })
    })

    test('throws error on unset operation', () => {
      const entry = createMockEntry('evento-edicion', undefined, 'unset')

      expect(() => mapToEventoEdicionInput(entry)).toThrow(
        'Cannot map unset operation to EventoEdicionInput'
      )
    })

    test('throws ZodError on missing numeroEdicion', () => {
      const entry = createMockEntry('evento-edicion', {
        nombre: 'Test'
      })

      expect(() => mapToEventoEdicionInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError on empty numeroEdicion', () => {
      const entry = createMockEntry('evento-edicion', {
        numeroEdicion: ''
      })

      expect(() => mapToEventoEdicionInput(entry)).toThrow(ZodError)
    })
  })

  describe('mapToEventoEdicionDiaInput()', () => {
    test('validates and returns correct EventoEdicionDiaInput with defaults', () => {
      const entry = createMockEntry('evento-edicion-dia', {
        eventoEdicionId: 1,
        fecha: '2024-06-15',
        horaInicio: '18:00',
        horaFin: '23:00'
      })

      const result = mapToEventoEdicionDiaInput(entry)

      expect(result).toMatchObject({
        eventoEdicionId: 1,
        fecha: '2024-06-15',
        horaInicio: '18:00',
        horaFin: '23:00',
        modalidad: 'presencial' // Default value
      })
    })

    test('accepts all fields including modalidad variations', () => {
      const entry = createMockEntry('evento-edicion-dia', {
        id: 20,
        eventoEdicionId: 5,
        lugarId: 3,
        fecha: '2024-07-20',
        horaInicio: '20:00',
        horaFin: '02:00',
        modalidad: 'hibrido'
      })

      const result = mapToEventoEdicionDiaInput(entry)

      expect(result).toEqual({
        id: 20,
        eventoEdicionId: 5,
        lugarId: 3,
        fecha: '2024-07-20',
        horaInicio: '20:00',
        horaFin: '02:00',
        modalidad: 'hibrido'
      })
    })

    test('accepts online modalidad', () => {
      const entry = createMockEntry('evento-edicion-dia', {
        eventoEdicionId: 1,
        fecha: '2024-08-01',
        horaInicio: '19:00',
        horaFin: '21:00',
        modalidad: 'online'
      })

      const result = mapToEventoEdicionDiaInput(entry)

      expect(result.modalidad).toBe('online')
    })

    test('throws error on unset operation', () => {
      const entry = createMockEntry('evento-edicion-dia', undefined, 'unset')

      expect(() => mapToEventoEdicionDiaInput(entry)).toThrow(
        'Cannot map unset operation to EventoEdicionDiaInput'
      )
    })

    test('throws ZodError on missing required fields', () => {
      const entry = createMockEntry('evento-edicion-dia', {
        eventoEdicionId: 1,
        fecha: '2024-06-15'
        // Missing horaInicio and horaFin
      })

      expect(() => mapToEventoEdicionDiaInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError on invalid modalidad enum', () => {
      const entry = createMockEntry('evento-edicion-dia', {
        eventoEdicionId: 1,
        fecha: '2024-06-15',
        horaInicio: '18:00',
        horaFin: '23:00',
        modalidad: 'invalid' // Not a valid enum value
      })

      expect(() => mapToEventoEdicionDiaInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError on negative eventoEdicionId', () => {
      const entry = createMockEntry('evento-edicion-dia', {
        eventoEdicionId: -1,
        fecha: '2024-06-15',
        horaInicio: '18:00',
        horaFin: '23:00'
      })

      expect(() => mapToEventoEdicionDiaInput(entry)).toThrow(ZodError)
    })
  })
})

describe('Organizacion Mappers', () => {
  describe('mapToOrganizacionInput()', () => {
    test('validates and returns correct OrganizacionInput with required fields', () => {
      const entry = createMockEntry('organizacion', {
        nombre: 'Frijol Mágico'
      })

      const result = mapToOrganizacionInput(entry)

      expect(result).toEqual({
        nombre: 'Frijol Mágico'
      })
    })

    test('accepts all optional fields', () => {
      const entry = createMockEntry('organizacion', {
        id: 1,
        nombre: 'Frijol Mágico',
        descripcion: 'Asociación cultural',
        mision: 'Promover la cultura',
        vision: 'Ser referentes en cultura'
      })

      const result = mapToOrganizacionInput(entry)

      expect(result).toEqual({
        id: 1,
        nombre: 'Frijol Mágico',
        descripcion: 'Asociación cultural',
        mision: 'Promover la cultura',
        vision: 'Ser referentes en cultura'
      })
    })

    test('throws error on unset operation', () => {
      const entry = createMockEntry('organizacion', undefined, 'unset')

      expect(() => mapToOrganizacionInput(entry)).toThrow(
        'Cannot map unset operation to OrganizacionInput'
      )
    })

    test('throws ZodError on missing nombre', () => {
      const entry = createMockEntry('organizacion', {
        descripcion: 'Test'
      })

      expect(() => mapToOrganizacionInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError on empty nombre', () => {
      const entry = createMockEntry('organizacion', {
        nombre: '' // Empty string not allowed
      })

      expect(() => mapToOrganizacionInput(entry)).toThrow(ZodError)
    })
  })

  describe('mapToOrganizacionEquipoInput()', () => {
    test('validates and returns correct OrganizacionEquipoInput', () => {
      const entry = createMockEntry('organizacion-equipo', {
        organizacionId: 1,
        nombre: 'Juan Pérez'
      })

      const result = mapToOrganizacionEquipoInput(entry)

      expect(result).toEqual({
        organizacionId: 1,
        nombre: 'Juan Pérez'
      })
    })

    test('accepts all optional fields', () => {
      const entry = createMockEntry('organizacion-equipo', {
        id: 15,
        organizacionId: 1,
        nombre: 'María González',
        cargo: 'Directora',
        rrss: '@maria_gonzalez'
      })

      const result = mapToOrganizacionEquipoInput(entry)

      expect(result).toEqual({
        id: 15,
        organizacionId: 1,
        nombre: 'María González',
        cargo: 'Directora',
        rrss: '@maria_gonzalez'
      })
    })

    test('throws error on unset operation', () => {
      const entry = createMockEntry('organizacion-equipo', undefined, 'unset')

      expect(() => mapToOrganizacionEquipoInput(entry)).toThrow(
        'Cannot map unset operation to OrganizacionEquipoInput'
      )
    })

    test('throws ZodError on missing required fields', () => {
      const entry = createMockEntry('organizacion-equipo', {
        nombre: 'Juan Pérez'
        // Missing organizacionId
      })

      expect(() => mapToOrganizacionEquipoInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError on invalid organizacionId type', () => {
      const entry = createMockEntry('organizacion-equipo', {
        organizacionId: 'invalid', // Should be number
        nombre: 'Juan Pérez'
      })

      expect(() => mapToOrganizacionEquipoInput(entry)).toThrow(ZodError)
    })

    test('throws ZodError on negative organizacionId', () => {
      const entry = createMockEntry('organizacion-equipo', {
        organizacionId: -5,
        nombre: 'Juan Pérez'
      })

      expect(() => mapToOrganizacionEquipoInput(entry)).toThrow(ZodError)
    })
  })
})
