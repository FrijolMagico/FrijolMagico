import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'
import { events } from '@frijolmagico/database/schema'

const { eventEditionDay } = events

export const editionDaySelectSchema = createSelectSchema(eventEditionDay).omit({
  createdAt: true,
  updatedAt: true
})

export const edicionDiaInsertSchema = createInsertSchema(eventEditionDay, {
  eventoEdicionId: () => z.number().int().positive(),
  lugarId: () => z.number().int().positive().optional(),
  fecha: (schema) => schema.min(1, { message: 'La fecha es obligatoria' }),
  horaInicio: (schema) =>
    schema.min(1, { message: 'La hora de inicio es obligatoria' }),
  horaFin: (schema) =>
    schema.min(1, { message: 'La hora de fin es obligatoria' })
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const edicionDiaUpdateSchema = createUpdateSchema(eventEditionDay, {
  lugarId: () => z.number().int().positive().nullable().optional(),
  fecha: (schema) => schema.min(1, { message: 'La fecha es obligatoria' }),
  horaInicio: (schema) =>
    schema.min(1, { message: 'La hora de inicio es obligatoria' }),
  horaFin: (schema) =>
    schema.min(1, { message: 'La hora de fin es obligatoria' })
}).omit({
  createdAt: true,
  updatedAt: true
})

export const dayFormStateSchema = z.object({
  tempId: z.string(),
  fecha: z.string().min(1, { message: 'La fecha es obligatoria' }),
  horaInicio: z
    .string()
    .min(1, { message: 'La hora de inicio es obligatoria' }),
  horaFin: z.string().min(1, { message: 'La hora de fin es obligatoria' }),
  modalidad: z.enum(['presencial', 'online', 'hibrido']).nullable(),
  lugarId: z.number().int().positive().nullable(),
  existingId: z.number().int().positive().optional()
})

export type EditionDay = z.infer<typeof editionDaySelectSchema>
export type EdicionDiaInsertInput = z.infer<typeof edicionDiaInsertSchema>
export type EdicionDiaUpdateInput = z.infer<typeof edicionDiaUpdateSchema>
export type DayFormStateInput = z.infer<typeof dayFormStateSchema>
