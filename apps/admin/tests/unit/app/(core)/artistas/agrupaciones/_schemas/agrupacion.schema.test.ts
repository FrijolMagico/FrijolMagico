import { describe, expect, test } from 'bun:test'
import {
  collectiveFormSchema,
  collectiveInsertSchema
} from '@/core/artistas/agrupaciones/_schemas/collective.schema'
import { collectiveQueryParamsSchema } from '@/core/artistas/agrupaciones/_schemas/query-params.schema'

describe('collective schemas', () => {
  test('validates form payload with required nombre and valid email', () => {
    const result = collectiveFormSchema.parse({
      nombre: 'Las del Valle',
      descripcion: 'Colectivo musical',
      correo: 'lasdelvalle@frijolmagico.cl',
      activo: true
    })

    expect(result.nombre).toBe('Las del Valle')
    expect(result.activo).toBe(true)
  })

  test('rejects empty nombre in form schema', () => {
    expect(() =>
      collectiveFormSchema.parse({
        nombre: '',
        descripcion: '',
        correo: '',
        activo: true
      })
    ).toThrow('El nombre es obligatorio')
  })

  test('server insert schema accepts nullable optional fields', () => {
    const result = collectiveInsertSchema.parse({
      nombre: 'Colectiva Norte',
      descripcion: null,
      correo: null,
      activo: true
    })

    expect(result).toMatchObject({
      nombre: 'Colectiva Norte',
      descripcion: null,
      correo: null,
      activo: true
    })
  })

  test('query params schema parses showDeleted boolean', () => {
    const result = collectiveQueryParamsSchema.parse({
      page: 1,
      limit: 20,
      search: '',
      showDeleted: true
    })

    expect(result.showDeleted).toBe(true)
  })
})