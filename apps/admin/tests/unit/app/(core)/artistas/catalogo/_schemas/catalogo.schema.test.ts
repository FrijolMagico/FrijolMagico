import { describe, test, expect } from 'bun:test'
import { catalogInsertSchema } from '@/core/artistas/catalogo/_schemas/catalog.schema'

describe('catalogInsertSchema', () => {
  test('validates valid data', () => {
    const validData = {
      artistaId: 1,
      orden: '001'
    }

    const result = catalogInsertSchema.parse(validData)

    expect(result.artistaId).toBe(1)
    expect(result.orden).toBe('001')
  })

  test('validates complete data', () => {
    const validData = {
      artistaId: 5,
      orden: '010',
      destacado: true,
      activo: false,
      descripcion: 'Artista destacado del mes'
    }

    const result = catalogInsertSchema.parse(validData)

    expect(result).toMatchObject(validData)
  })

  test('rejects invalid artistaId', () => {
    const invalidData = {
      artistaId: 0,
      orden: '001'
    }

    expect(() => catalogInsertSchema.parse(invalidData)).toThrow()
  })

  test('rejects empty order', () => {
    const invalidData = {
      artistaId: 1,
      orden: ''
    }

    expect(() => catalogInsertSchema.parse(invalidData)).toThrow()
  })

  test('rejects non-boolean featured', () => {
    const invalidData = {
      artistaId: 1,
      orden: '001',
      destacado: 'true' as unknown as boolean
    }

    expect(() => catalogInsertSchema.parse(invalidData)).toThrow()
  })

  test('allows optional description', () => {
    const validData = {
      artistaId: 1,
      orden: '001',
      descripcion: undefined
    }

    const result = catalogInsertSchema.parse(validData)

    expect(result.descripcion).toBeUndefined()
  })
})
