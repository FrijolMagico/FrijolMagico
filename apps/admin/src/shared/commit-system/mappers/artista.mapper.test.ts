import { describe, expect, test } from 'bun:test'
import type { JournalEntry } from '@/shared/change-journal/lib/types'
import {
  mapToArtistaImagenInput,
  mapToArtistaInput,
  mapToCatalogoArtistaInput
} from './artista.mapper'

const createBaseEntry = (section: string, value: unknown): JournalEntry => ({
  entryId: 'test-entry-id',
  schemaVersion: 1,
  section,
  scopeKey: `${section}:test-entity:field`,
  payload: { op: 'set', value },
  timestampMs: Date.now(),
  clientId: 'test-client-id',
  sessionId: 'test-session-id'
})

describe('mapToArtistaInput', () => {
  test('maps valid artista data with required fields', () => {
    const entry = createBaseEntry('artista', {
      pseudonimo: 'El Magnífico',
      slug: 'el-magnifico'
    })

    const result = mapToArtistaInput(entry)

    expect(result).toEqual({
      estadoId: 1,
      pseudonimo: 'El Magnífico',
      slug: 'el-magnifico'
    })
  })

  test('maps complete artista data', () => {
    const entry = createBaseEntry('artista', {
      id: 5,
      estadoId: 2,
      nombre: 'Juan Pérez',
      pseudonimo: 'El Magnífico',
      slug: 'el-magnifico',
      rut: '12345678-9',
      correo: 'juan@example.com',
      rrss: '@elmagnifico',
      ciudad: 'Santiago',
      pais: 'Chile'
    })

    const result = mapToArtistaInput(entry)

    expect(result).toEqual({
      id: 5,
      estadoId: 2,
      nombre: 'Juan Pérez',
      pseudonimo: 'El Magnífico',
      slug: 'el-magnifico',
      rut: '12345678-9',
      correo: 'juan@example.com',
      rrss: '@elmagnifico',
      ciudad: 'Santiago',
      pais: 'Chile'
    })
  })

  test('throws on missing pseudonimo', () => {
    const entry = createBaseEntry('artista', {
      slug: 'el-magnifico'
    })

    expect(() => mapToArtistaInput(entry)).toThrow()
  })

  test('throws on missing slug', () => {
    const entry = createBaseEntry('artista', {
      pseudonimo: 'El Magnífico'
    })

    expect(() => mapToArtistaInput(entry)).toThrow()
  })

  test('throws on empty pseudonimo', () => {
    const entry = createBaseEntry('artista', {
      pseudonimo: '',
      slug: 'el-magnifico'
    })

    expect(() => mapToArtistaInput(entry)).toThrow()
  })

  test('throws on unset operation', () => {
    const entry: JournalEntry = {
      entryId: 'test-entry-id',
      schemaVersion: 1,
      section: 'artista',
      scopeKey: 'artista:test-entity:field',
      payload: { op: 'unset' },
      timestampMs: Date.now(),
      clientId: 'test-client-id',
      sessionId: 'test-session-id'
    }

    expect(() => mapToArtistaInput(entry)).toThrow(
      'Cannot map unset operation to ArtistaInput'
    )
  })
})

describe('mapToArtistaImagenInput', () => {
  test('maps valid artista imagen data with required fields', () => {
    const entry = createBaseEntry('artista-imagen', {
      artistaId: 5,
      imagenUrl: 'https://example.com/image.jpg',
      tipo: 'avatar'
    })

    const result = mapToArtistaImagenInput(entry)

    expect(result).toEqual({
      artistaId: 5,
      imagenUrl: 'https://example.com/image.jpg',
      tipo: 'avatar',
      orden: 1
    })
  })

  test('maps complete artista imagen data', () => {
    const entry = createBaseEntry('artista-imagen', {
      id: 10,
      artistaId: 5,
      imagenUrl: 'https://example.com/gallery.jpg',
      tipo: 'galeria',
      orden: 3,
      metadata: '{"caption": "Performance 2024"}'
    })

    const result = mapToArtistaImagenInput(entry)

    expect(result).toEqual({
      id: 10,
      artistaId: 5,
      imagenUrl: 'https://example.com/gallery.jpg',
      tipo: 'galeria',
      orden: 3,
      metadata: '{"caption": "Performance 2024"}'
    })
  })

  test('throws on missing artistaId', () => {
    const entry = createBaseEntry('artista-imagen', {
      imagenUrl: 'https://example.com/image.jpg',
      tipo: 'avatar'
    })

    expect(() => mapToArtistaImagenInput(entry)).toThrow()
  })

  test('throws on invalid tipo', () => {
    const entry = createBaseEntry('artista-imagen', {
      artistaId: 5,
      imagenUrl: 'https://example.com/image.jpg',
      tipo: 'invalid'
    })

    expect(() => mapToArtistaImagenInput(entry)).toThrow()
  })

  test('throws on unset operation', () => {
    const entry: JournalEntry = {
      entryId: 'test-entry-id',
      schemaVersion: 1,
      section: 'artista-imagen',
      scopeKey: 'artista-imagen:test-entity:field',
      payload: { op: 'unset' },
      timestampMs: Date.now(),
      clientId: 'test-client-id',
      sessionId: 'test-session-id'
    }

    expect(() => mapToArtistaImagenInput(entry)).toThrow(
      'Cannot map unset operation to ArtistaImagenInput'
    )
  })
})

describe('mapToCatalogoArtistaInput', () => {
  test('maps valid catalogo artista data with required fields', () => {
    const entry = createBaseEntry('catalogo-artista', {
      artistaId: 5,
      orden: '001'
    })

    const result = mapToCatalogoArtistaInput(entry)

    expect(result).toEqual({
      artistaId: 5,
      orden: '001',
      destacado: false,
      activo: true
    })
  })

  test('maps complete catalogo artista data', () => {
    const entry = createBaseEntry('catalogo-artista', {
      id: 15,
      artistaId: 5,
      orden: '010',
      destacado: true,
      activo: false,
      descripcion: 'Artista destacado del mes'
    })

    const result = mapToCatalogoArtistaInput(entry)

    expect(result).toEqual({
      id: 15,
      artistaId: 5,
      orden: '010',
      destacado: true,
      activo: false,
      descripcion: 'Artista destacado del mes'
    })
  })

  test('throws on missing artistaId', () => {
    const entry = createBaseEntry('catalogo-artista', {
      orden: '001'
    })

    expect(() => mapToCatalogoArtistaInput(entry)).toThrow()
  })

  test('throws on missing orden', () => {
    const entry = createBaseEntry('catalogo-artista', {
      artistaId: 5
    })

    expect(() => mapToCatalogoArtistaInput(entry)).toThrow()
  })

  test('throws on unset operation', () => {
    const entry: JournalEntry = {
      entryId: 'test-entry-id',
      schemaVersion: 1,
      section: 'catalogo-artista',
      scopeKey: 'catalogo-artista:test-entity:field',
      payload: { op: 'unset' },
      timestampMs: Date.now(),
      clientId: 'test-client-id',
      sessionId: 'test-session-id'
    }

    expect(() => mapToCatalogoArtistaInput(entry)).toThrow(
      'Cannot map unset operation to CatalogoArtistaInput'
    )
  })
})
