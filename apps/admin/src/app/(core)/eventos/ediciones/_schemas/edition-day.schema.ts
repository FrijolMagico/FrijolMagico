import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'
import { events } from '@frijolmagico/database/schema'

const { eventEditionDay } = events
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/
const validTime = (schema: z.ZodString, requiredMessage: string) =>
  schema.min(1, { message: requiredMessage }).regex(TIME_PATTERN, {
    message: 'Ingresa una hora válida (HH:mm)'
  })

export const editionDaySelectSchema = createSelectSchema(eventEditionDay).omit({
  createdAt: true,
  updatedAt: true
})

export const edicionDiaInsertSchema = createInsertSchema(eventEditionDay, {
  eventoEdicionId: () => z.number().int().positive(),
  lugarId: () => z.number().int().positive().optional(),
  fecha: (schema) => schema.min(1, { message: 'La fecha es obligatoria' }),
  horaInicio: (schema) => validTime(schema, 'La hora de inicio es obligatoria'),
  horaFin: (schema) => validTime(schema, 'La hora de fin es obligatoria')
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const edicionDiaUpdateSchema = createUpdateSchema(eventEditionDay, {
  lugarId: () => z.number().int().positive().nullable().optional(),
  fecha: (schema) => schema.min(1, { message: 'La fecha es obligatoria' }),
  horaInicio: (schema) => validTime(schema, 'La hora de inicio es obligatoria'),
  horaFin: (schema) => validTime(schema, 'La hora de fin es obligatoria')
}).omit({
  createdAt: true,
  updatedAt: true
})

export const dayFormStateSchema = z.object({
  tempId: z.string(),
  fecha: z.string().min(1, { message: 'La fecha es obligatoria' }),
  horaInicio: validTime(z.string(), 'La hora de inicio es obligatoria'),
  horaFin: validTime(z.string(), 'La hora de fin es obligatoria'),
  modalidad: z.enum(['presencial', 'online', 'hibrido']).nullable(),
  lugarId: z.number().int().positive().nullable(),
  existingId: z.number().int().positive().optional()
})

export type EditionDay = z.infer<typeof editionDaySelectSchema>
export type EdicionDiaInsertInput = z.infer<typeof edicionDiaInsertSchema>
export type EdicionDiaUpdateInput = z.infer<typeof edicionDiaUpdateSchema>
export type DayFormStateInput = z.infer<typeof dayFormStateSchema>
