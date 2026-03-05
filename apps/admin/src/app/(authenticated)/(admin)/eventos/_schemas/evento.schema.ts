import { z } from 'zod'
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import { events } from '@frijolmagico/database/schema'

const { event } = events

export const eventoInsertSchema = createInsertSchema(event, {
  nombre: (s) => s.min(1, { message: 'El nombre es obligatorio' }),
  slug: (s) => s.min(1, { message: 'El slug es obligatorio' }),
  organizacionId: (s) => s.default(1)
})

export const eventoUpdateSchema = createUpdateSchema(event)

export const eventoSchema = eventoInsertSchema

export const eventoFormSchema = eventoInsertSchema.pick({
  nombre: true,
  descripcion: true
})

export type EventoInsertInput = z.infer<typeof eventoInsertSchema>
export type EventoFormInput = z.infer<typeof eventoFormSchema>
export type EventoInput = EventoInsertInput
