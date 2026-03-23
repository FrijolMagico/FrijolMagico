import { describe, expect, test } from 'bun:test'
import {
  agrupacionFormSchema,
  agrupacionInsertSchema
} from '@/core/artistas/agrupaciones/_schemas/agrupacion.schema'
import { agrupacionQueryParamsSchema } from '@/core/artistas/agrupaciones/_schemas/query-params.schema'

describe('agrupacion schemas', () => {
  test('validates form payload with required nombre and valid email', () => {
    const result = agrupacionFormSchema.parse({
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
      agrupacionFormSchema.parse({
        nombre: '',
        descripcion: '',
        correo: '',
        activo: true
      })
    ).toThrow('El nombre es obligatorio')
  })

  test('server insert schema accepts nullable optional fields', () => {
    const result = agrupacionInsertSchema.parse({
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

  test('query params schema parses mostrar_eliminados boolean', () => {
    const result = agrupacionQueryParamsSchema.parse({
      page: 1,
      limit: 20,
      search: '',
      mostrar_eliminados: true
    })

    expect(result.mostrar_eliminados).toBe(true)
  })
})
