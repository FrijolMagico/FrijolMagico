import { z } from 'zod'
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import { core, events } from '@frijolmagico/database/schema'

const { eventEdition, eventEditionDay } = events
const { place } = core

export const edicionInsertSchema = createInsertSchema(eventEdition, {
  eventoId: () => z.coerce.number().int().positive(),
  numeroEdicion: (s) =>
    s.min(1, { message: 'El número de edición es obligatorio' }),
  slug: (s) => s.min(1, { message: 'El slug es obligatorio' })
})

export const edicionUpdateSchema = createUpdateSchema(eventEdition)

export const edicionSchema = edicionInsertSchema

export const edicionFormSchema = edicionInsertSchema
  .pick({
    eventoId: true,
    nombre: true,
    numeroEdicion: true,
    posterUrl: true
  })
  .extend({
    eventoId: z.string().min(1, { error: 'El evento es obligatorio' })
  })

export const edicionDiaInsertSchema = createInsertSchema(eventEditionDay, {
  eventoEdicionId: () => z.coerce.number().int().positive(),
  lugarId: (s) => s.optional(),
  fecha: (s) => s.min(1, { message: 'La fecha es obligatoria' }),
  horaInicio: (s) => s.min(1, { message: 'La hora de inicio es obligatoria' }),
  horaFin: (s) => s.min(1, { message: 'La hora de fin es obligatoria' })
})

export const edicionDiaUpdateSchema = createUpdateSchema(eventEditionDay)

export const edicionDiaSchema = edicionDiaInsertSchema

export const edicionDiaFormSchema = edicionDiaInsertSchema
  .omit({ eventoEdicionId: true })
  .extend({
    eventoEdicionId: z.string().min(1),
    lugarId: z.string().optional()
  })

export const lugarInsertSchema = createInsertSchema(place, {
  nombre: (s) => s.min(1, { message: 'El nombre es obligatorio' }),
  url: z.url({ message: 'La URL debe ser válida' }).optional()
})

export const lugarUpdateSchema = createUpdateSchema(place)

export const lugarSchema = lugarInsertSchema

export const lugarFormSchema = lugarInsertSchema.pick({
  nombre: true,
  direccion: true,
  ciudad: true,
  coordenadas: true,
  url: true
})

export type EdicionInput = z.infer<typeof edicionInsertSchema>
export type EdicionFormInput = z.infer<typeof edicionFormSchema>
export type EdicionDiaInput = Omit<
  z.infer<typeof edicionDiaInsertSchema>,
  'eventoEdicionId' | 'lugarId'
> & {
  eventoEdicionId: number
  lugarId?: number
}
export type EdicionDiaFormInput = z.infer<typeof edicionDiaFormSchema>
export type LugarInput = z.infer<typeof lugarInsertSchema>
export type LugarFormInput = z.infer<typeof lugarFormSchema>
