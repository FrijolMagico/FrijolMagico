import { describe, test, expect } from 'bun:test'
import { catalogoArtistaSchema } from './catalogo.schema'

describe('catalogoArtistaSchema', () => {
  test('valida datos válidos con defaults', () => {
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

  test('valida datos completos', () => {
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

  test('rechaza artistaId inválido', () => {
    const invalidData = {
      artistaId: 0,
      orden: '001'
    }

    expect(() => catalogoArtistaSchema.parse(invalidData)).toThrow()
  })

  test('rechaza orden vacío', () => {
    const invalidData = {
      artistaId: 1,
      orden: ''
    }

    expect(() => catalogoArtistaSchema.parse(invalidData)).toThrow()
  })

  test('rechaza destacado no booleano', () => {
    const invalidData = {
      artistaId: 1,
      orden: '001',
      destacado: 'true' as unknown as boolean
    }

    expect(() => catalogoArtistaSchema.parse(invalidData)).toThrow()
  })

  test('rechaza activo no booleano', () => {
    const invalidData = {
      artistaId: 1,
      orden: '001',
      activo: 1 as unknown as boolean
    }

    expect(() => catalogoArtistaSchema.parse(invalidData)).toThrow()
  })

  test('permite descripcion opcional', () => {
    const validData = {
      artistaId: 1,
      orden: '001',
      descripcion: undefined
    }

    const result = catalogoArtistaSchema.parse(validData)

    expect(result.descripcion).toBeUndefined()
  })
})
