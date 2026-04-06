import { z } from 'zod'
import { dayFormStateSchema } from './edition-day.schema'
import { edicionFormSchema } from './edition.schema'

export const edicionRootFormSchema = edicionFormSchema
  .omit({ posterUrl: true })
  .extend({
    days: z.array(dayFormStateSchema)
  })

export const edicionWithDaysSchema = z.object({
  id: z.number().int().positive().nullable(),
  eventoId: z.number().int().positive(),
  numeroEdicion: z
    .string()
    .min(1, { message: 'El número de edición es obligatorio' }),
  nombre: z.string().nullable().optional(),
  posterUrl: z.string().nullable().optional(),
  days: z.array(dayFormStateSchema)
})

export type EditionWithDays = z.infer<typeof edicionWithDaysSchema>
export type EdicionRootFormInput = z.infer<typeof edicionRootFormSchema>
export type EdicionWithDaysInput = EditionWithDays
