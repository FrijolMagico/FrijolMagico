import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'
import { events } from '@frijolmagico/database/schema'

const { eventEdition } = events

export const editionSelectSchema = createSelectSchema(eventEdition, {
  eventoId: z.number().int().positive()
}).omit({
  createdAt: true,
  updatedAt: true
})

export const edicionInsertSchema = createInsertSchema(eventEdition, {
  eventoId: () => z.number().int().positive(),
  numeroEdicion: (schema) =>
    schema.min(1, { message: 'El número de edición es obligatorio' }),
  slug: (schema) => schema.min(1, { message: 'El slug es obligatorio' })
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const edicionUpdateSchema = createUpdateSchema(eventEdition, {
  eventoId: () => z.number().int().positive(),
  numeroEdicion: (schema) =>
    schema.min(1, { message: 'El número de edición es obligatorio' }),
  slug: (schema) => schema.min(1, { message: 'El slug es obligatorio' })
}).omit({
  createdAt: true,
  updatedAt: true
})

export const edicionFormSchema = edicionInsertSchema
  .pick({
    eventoId: true,
    numeroEdicion: true,
    nombre: true,
    posterUrl: true
  })
  .extend({
    eventoId: z.number().int().positive({ message: 'El evento es obligatorio' })
  })

export type Edition = z.infer<typeof editionSelectSchema>
export type EdicionInsertInput = z.infer<typeof edicionInsertSchema>
export type EdicionUpdateInput = z.infer<typeof edicionUpdateSchema>
export type EdicionFormInput = z.infer<typeof edicionFormSchema>
