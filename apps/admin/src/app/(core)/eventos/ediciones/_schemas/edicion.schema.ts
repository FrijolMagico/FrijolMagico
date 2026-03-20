import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'
import { core, events } from '@frijolmagico/database/schema'

const { eventEdition, eventEditionDay } = events
const { place } = core

export const editionSelectSchema = createSelectSchema(eventEdition, {
  eventoId: z.number().int().positive()
}).omit({
  createdAt: true,
  updatedAt: true
})

export const editionDaySelectSchema = createSelectSchema(eventEditionDay).omit({
  createdAt: true,
  updatedAt: true
})

export const placeSelectSchema = createSelectSchema(place, {
  url: z.url().nullable()
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

export const edicionSchema = edicionInsertSchema

export const edicionFormSchema = edicionInsertSchema.pick({
  eventoId: true,
  nombre: true,
  numeroEdicion: true,
  posterUrl: true
})

export const dayFormStateSchema = z.object({
  tempId: z.string(),
  fecha: z.string().min(1, { message: 'La fecha es obligatoria' }),
  horaInicio: z.string().min(1, { message: 'La hora de inicio es obligatoria' }),
  horaFin: z.string().min(1, { message: 'La hora de fin es obligatoria' }),
  modalidad: z.enum(['presencial', 'online', 'hibrido']).nullable(),
  lugarId: z.number().int().positive().nullable(),
  existingId: z.number().int().positive().optional()
})

export const edicionRootFormSchema = edicionFormSchema
  .omit({ posterUrl: true })
  .extend({
    days: z.array(dayFormStateSchema)
  })

export const edicionDiaInsertSchema = createInsertSchema(eventEditionDay, {
  eventoEdicionId: () => z.number().int().positive(),
  lugarId: () => z.number().int().positive().optional(),
  fecha: (schema) => schema.min(1, { message: 'La fecha es obligatoria' }),
  horaInicio: (schema) =>
    schema.min(1, { message: 'La hora de inicio es obligatoria' }),
  horaFin: (schema) => schema.min(1, { message: 'La hora de fin es obligatoria' })
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
  horaFin: (schema) => schema.min(1, { message: 'La hora de fin es obligatoria' })
}).omit({
  createdAt: true,
  updatedAt: true
})

export const edicionDiaSchema = edicionDiaInsertSchema

export const edicionDiaFormSchema = edicionDiaInsertSchema.extend({
  lugarId: z.number().int().positive().nullable().optional()
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

export const lugarSchema = lugarInsertSchema

export const lugarFormSchema = lugarInsertSchema.pick({
  nombre: true,
  direccion: true,
  ciudad: true,
  coordenadas: true,
  url: true
})

export const edicionWithDaysSchema = z.object({
  id: z.number().int().positive().nullable(),
  eventoId: z.number().int().positive(),
  numeroEdicion: z.string().min(1, { message: 'El número de edición es obligatorio' }),
  nombre: z.string().nullable().optional(),
  posterUrl: z.string().nullable().optional(),
  days: z.array(dayFormStateSchema)
})

export type Edition = z.infer<typeof editionSelectSchema>
export type EditionDay = z.infer<typeof editionDaySelectSchema>
export type Place = z.infer<typeof placeSelectSchema>
export type EdicionRootFormInput = z.infer<typeof edicionRootFormSchema>
export type EdicionInput = z.infer<typeof edicionInsertSchema>
export type EdicionFormInput = z.infer<typeof edicionFormSchema>
export type EdicionUpdateInput = z.infer<typeof edicionUpdateSchema>
export type EdicionDiaInput = z.infer<typeof edicionDiaInsertSchema>
export type EdicionDiaFormInput = z.infer<typeof edicionDiaFormSchema>
export type EdicionDiaUpdateInput = z.infer<typeof edicionDiaUpdateSchema>
export type LugarInput = z.infer<typeof lugarInsertSchema>
export type LugarFormInput = z.infer<typeof lugarFormSchema>
export type LugarUpdateInput = z.infer<typeof lugarUpdateSchema>
export type DayFormStateInput = z.infer<typeof dayFormStateSchema>
export type EdicionWithDaysInput = z.infer<typeof edicionWithDaysSchema>
