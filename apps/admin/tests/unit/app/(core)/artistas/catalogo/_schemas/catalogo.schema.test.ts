import { describe, test, expect } from 'bun:test'
import { catalogInsertSchema } from '@/core/artistas/catalogo/_schemas/catalog.schema'

describe('catalogInsertSchema', () => {
  test('validates catalog identity with the selected contextual pseudonym', () => {
    const validData = {
      artistaId: 1,
      pseudonimoId: 11,
      orden: '001'
    }

    expect(catalogInsertSchema.parse(validData)).toMatchObject(validData)
  })

  test('requires a positive contextual pseudonym ID', () => {
    expect(() =>
      catalogInsertSchema.parse({ artistaId: 1, pseudonimoId: 0, orden: '001' })
    ).toThrow()
  })

  test('rejects invalid artist IDs and empty ordering values', () => {
    expect(() =>
      catalogInsertSchema.parse({ artistaId: 0, pseudonimoId: 11, orden: '001' })
    ).toThrow()
    expect(() =>
      catalogInsertSchema.parse({ artistaId: 1, pseudonimoId: 11, orden: '' })
    ).toThrow()
  })

  test('validates catalog fields and allows an optional description', () => {
    const validData = {
      artistaId: 5,
      pseudonimoId: 51,
      orden: '010',
      destacado: true,
      activo: false,
      descripcion: 'Artista destacado del mes'
    }

    expect(catalogInsertSchema.parse(validData)).toMatchObject(validData)
    expect(
      catalogInsertSchema.parse({ ...validData, descripcion: undefined }).descripcion
    ).toBeUndefined()
  })
})
