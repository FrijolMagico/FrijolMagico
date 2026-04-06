import { describe, expect, test } from 'bun:test'
import {
  bandFormSchema,
  bandInsertSchema,
  bandUpdateSchema
} from '@/core/artistas/bandas/_schemas/banda.schema'

describe('bandInsertSchema', () => {
  test('requires a non-empty name', () => {
    expect(() =>
      bandInsertSchema.parse({
        name: '',
        description: null,
        email: null,
        phone: null,
        city: null,
        country: null,
        active: true
      })
    ).toThrow('El nombre es obligatorio')
  })

  test('rejects invalid email format', () => {
    expect(() =>
      bandInsertSchema.parse({
        name: 'Los Andes',
        description: null,
        email: 'correo-invalido',
        phone: null,
        city: null,
        country: null,
        active: true
      })
    ).toThrow('Formato de correo inválido')
  })

  test('accepts valid band payloads', () => {
    const result = bandInsertSchema.parse({
      name: 'Los Andes',
      description: 'Folclor latinoamericano',
      email: 'losandes@frijolmagico.cl',
      phone: '+56912345678',
      city: 'La Serena',
      country: 'Chile',
      active: true
    })

    expect(result.name).toBe('Los Andes')
    expect(result.email).toBe('losandes@frijolmagico.cl')
  })
})

describe('bandUpdateSchema', () => {
  test('requires a valid id', () => {
    expect(() =>
      bandUpdateSchema.parse({
        id: 0,
        name: 'Los Andes'
      })
    ).toThrow('ID de banda inválido')
  })
})

describe('bandFormSchema', () => {
  test('allows empty optional email for the dialog form', () => {
    const result = bandFormSchema.parse({
      name: 'Los Andes',
      description: '',
      email: '',
      phone: '',
      city: '',
      country: '',
      active: true
    })

    expect(result.email).toBe('')
  })
})
