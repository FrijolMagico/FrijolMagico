import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'
import { events } from '@frijolmagico/database/schema'

const { event } = events

export const eventSelectSchema = createSelectSchema(event).omit({
  createdAt: true,
  updatedAt: true
})

export const eventInsertSchema = createInsertSchema(event, {
  nombre: (s) => s.min(1, { message: 'El nombre es obligatorio' }),
  slug: z.string().min(1, { message: 'El slug es obligatorio' }),
  organizacionId: (s) => s.default(1)
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const eventUpdateSchema = createUpdateSchema(event)

export const eventFormSchema = eventInsertSchema.pick({
  nombre: true,
  descripcion: true
})

export type Event = z.infer<typeof eventSelectSchema>
export type EventInsertInput = z.infer<typeof eventInsertSchema>
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>
export type EventFormInput = z.infer<typeof eventFormSchema>
