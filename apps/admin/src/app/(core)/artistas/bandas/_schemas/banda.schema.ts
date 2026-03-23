import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'
import { artist } from '@frijolmagico/database/schema'

const bandTable = artist.band

const optionalEmailSchema = z
  .email({
    error: 'Formato de correo inválido'
  })
  .nullable()
  .optional()

export const bandSelectSchema = createSelectSchema(bandTable)

export const bandInsertSchema = createInsertSchema(bandTable, {
  name: (schema) => schema.trim().min(1, { error: 'El nombre es obligatorio' }),
  email: () => optionalEmailSchema
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
})

export const bandUpdateSchema = createUpdateSchema(bandTable, {
  name: (schema) => schema.trim().min(1, { error: 'El nombre es obligatorio' }),
  email: () => optionalEmailSchema
})
  .omit({
    createdAt: true,
    updatedAt: true,
    deletedAt: true
  })
  .extend({
    id: z.number().int().positive({ error: 'ID de banda inválido' })
  })

export const bandFormSchema = z.object({
  name: z.string().trim().min(1, { error: 'El nombre es obligatorio' }),
  description: z.string().optional(),
  email: z.union([
    z.literal(''),
    z.email({ error: 'Formato de correo inválido' })
  ]),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  active: z.boolean()
})

export type Band = z.infer<typeof bandSelectSchema>
export type BandInsertInput = z.infer<typeof bandInsertSchema>
export type BandUpdateInput = z.infer<typeof bandUpdateSchema>
export type BandFormInput = z.infer<typeof bandFormSchema>
