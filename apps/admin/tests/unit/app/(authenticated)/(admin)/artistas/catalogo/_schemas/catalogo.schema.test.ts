import { describe, test, expect } from 'bun:test'
import { catalogoArtistaSchema } from '@/app/(authenticated)/(admin)/artistas/catalogo/_schemas/catalogo.schema'

describe('catalogoArtistaSchema', () => {
  test('validates valid data with defaults', () => {
    const validData = {
      artistaId: 1,
      orden: '001'
    }

    const result = catalogoArtistaSchema.parse(validData)

    expect(result).toEqual({
      artistaId: 1,
      orden: '001',
      destacado: false,
      activo: true
    })
  })

  test('validates complete data', () => {
    const validData = {
      id: 1,
      artistaId: 5,
      orden: '010',
      destacado: true,
      activo: false,
      descripcion: 'Artista destacado del mes'
    }

    const result = catalogoArtistaSchema.parse(validData)

    expect(result).toEqual(validData)
  })

  test('rejects invalid artistaId', () => {
    const invalidData = {
      artistaId: 0,
      orden: '001'
    }

    expect(() => catalogoArtistaSchema.parse(invalidData)).toThrow()
  })

  test('rejects empty order', () => {
    const invalidData = {
      artistaId: 1,
      orden: ''
    }

    expect(() => catalogoArtistaSchema.parse(invalidData)).toThrow()
  })

  test('rejects non-boolean featured', () => {
    const invalidData = {
      artistaId: 1,
      orden: '001',
      destacado: 'true' as unknown as boolean
    }

    expect(() => catalogoArtistaSchema.parse(invalidData)).toThrow()
  })

  test('rejects non-boolean active', () => {
    const invalidData = {
      artistaId: 1,
      orden: '001',
      activo: 1 as unknown as boolean
    }

    expect(() => catalogoArtistaSchema.parse(invalidData)).toThrow()
  })

  test('allows optional description', () => {
    const validData = {
      artistaId: 1,
      orden: '001',
      descripcion: undefined
    }

    const result = catalogoArtistaSchema.parse(validData)

    expect(result.descripcion).toBeUndefined()
  })
})
