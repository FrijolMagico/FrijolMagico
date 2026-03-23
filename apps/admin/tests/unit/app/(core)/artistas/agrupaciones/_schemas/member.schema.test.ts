import { describe, expect, test } from 'bun:test'
import {
  memberActionSchema,
  memberFormSchema,
  memberRemoveSchema
} from '@/core/artistas/agrupaciones/_schemas/member.schema'

describe('member schemas', () => {
  test('validates client member form input', () => {
    const result = memberFormSchema.parse({
      agrupacionId: '1',
      artistaId: '2',
      rol: 'Voz principal',
      activo: true
    })

    expect(result.artistaId).toBe('2')
    expect(result.rol).toBe('Voz principal')
  })

  test('validates server member action payload', () => {
    const result = memberActionSchema.parse({
      agrupacionId: 1,
      artistaId: 2,
      rol: 'Percusión',
      activo: false
    })

    expect(result.activo).toBe(false)
  })

  test('rejects invalid remove payload', () => {
    expect(() =>
      memberRemoveSchema.parse({
        agrupacionId: 0,
        artistaId: 2
      })
    ).toThrow()
  })
})
