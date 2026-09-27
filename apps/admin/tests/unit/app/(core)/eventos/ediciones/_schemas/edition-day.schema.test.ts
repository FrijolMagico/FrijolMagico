import { expect, test } from 'bun:test'
import {
  dayFormStateSchema,
  edicionDiaInsertSchema,
  edicionDiaUpdateSchema
} from '@/core/eventos/ediciones/_schemas/edition-day.schema'

const day = {
  tempId: 'day', fecha: '2026-07-01', horaInicio: '10:30', horaFin: '11:00',
  modalidad: 'online' as const, lugarId: null
}
const insert = {
  eventoEdicionId: 1, fecha: day.fecha, horaInicio: day.horaInicio,
  horaFin: day.horaFin
}
const update = { horaInicio: day.horaInicio, horaFin: day.horaFin }

for (const [name, schema, input] of [
  ['day form', dayFormStateSchema, day],
  ['server insert', edicionDiaInsertSchema, insert],
  ['server update', edicionDiaUpdateSchema, update]
] as const) {
  test(`${name} accepts canonical HH:mm and rejects stale, partial and out-of-range time`, () => {
    expect(schema.safeParse(input).success).toBe(true)
    for (const field of ['horaInicio', 'horaFin'] as const) {
      for (const time of ['2:30', '10:3', '24:30', '10:60', ':30', '10:', '']) {
        const result = schema.safeParse({ ...input, [field]: time })
        expect(result.success).toBe(false)
        if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === field)).toBe(true)
      }
    }
  })
}
