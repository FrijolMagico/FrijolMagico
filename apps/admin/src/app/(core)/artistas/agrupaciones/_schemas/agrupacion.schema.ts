import { z } from 'zod'
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import { artist } from '@frijolmagico/database/schema'

const { collective } = artist

const optionalEmailSchema = z.union([
  z.email({ error: 'El correo debe ser válido' }),
  z.null()
])

export const agrupacionInsertSchema = createInsertSchema(collective, {
  nombre: (schema) => schema.min(1, { error: 'El nombre es obligatorio' }),
  correo: () => optionalEmailSchema.optional()
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
})

export const agrupacionUpdateSchema = createUpdateSchema(collective, {
  nombre: (schema) => schema.min(1, { error: 'El nombre es obligatorio' }),
  correo: () => optionalEmailSchema.optional()
}).omit({
  createdAt: true,
  updatedAt: true,
  deletedAt: true
})

export const agrupacionFormSchema = z.object({
  nombre: z.string().trim().min(1, { error: 'El nombre es obligatorio' }),
  descripcion: z.string(),
  correo: z.union([
    z.literal(''),
    z.email({ error: 'El correo debe ser válido' })
  ]),
  activo: z.boolean()
})

export type AgrupacionInsertInput = z.infer<typeof agrupacionInsertSchema>
export type AgrupacionUpdateInput = z.infer<typeof agrupacionUpdateSchema>
export type AgrupacionFormInput = z.infer<typeof agrupacionFormSchema>
