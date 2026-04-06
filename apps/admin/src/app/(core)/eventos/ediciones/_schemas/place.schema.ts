import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'
import { core } from '@frijolmagico/database/schema'

const { place } = core

export const placeSelectSchema = createSelectSchema(place, {
  url: z.url().nullable()
}).omit({
  createdAt: true,
  updatedAt: true
})

export const lugarInsertSchema = createInsertSchema(place, {
  nombre: (schema) => schema.min(1, { message: 'El nombre es obligatorio' }),
  url: z.url({ error: 'La URL debe ser válida' }).nullable().optional()
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const lugarUpdateSchema = createUpdateSchema(place, {
  nombre: (schema) => schema.min(1, { message: 'El nombre es obligatorio' }),
  url: z.url({ error: 'La URL debe ser válida' }).nullable().optional()
}).omit({
  createdAt: true,
  updatedAt: true
})

export type Place = z.infer<typeof placeSelectSchema>
export type LugarInsertInput = z.infer<typeof lugarInsertSchema>
export type LugarUpdateInput = z.infer<typeof lugarUpdateSchema>
