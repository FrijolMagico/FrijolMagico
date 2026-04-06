import { z } from 'zod'
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import { artist } from '@frijolmagico/database/schema'

const { collective } = artist

const optionalEmailSchema = z.union([
  z.email({ error: 'El correo debe ser válido' }),
  z.null()
])

export const collectiveInsertSchema = createInsertSchema(collective, {
  nombre: (schema) => schema.min(1, { error: 'El nombre es obligatorio' }),
  correo: () => optionalEmailSchema.optional()
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
})

export const collectiveUpdateSchema = createUpdateSchema(collective, {
  nombre: (schema) => schema.min(1, { error: 'El nombre es obligatorio' }),
  correo: () => optionalEmailSchema.optional()
}).omit({
  createdAt: true,
  updatedAt: true,
  deletedAt: true
})

export const collectiveFormSchema = z.object({
  nombre: z.string().trim().min(1, { error: 'El nombre es obligatorio' }),
  descripcion: z.string(),
  correo: z.union([
    z.literal(''),
    z.email({ error: 'El correo debe ser válido' })
  ]),
  activo: z.boolean()
})

export const memberDraftItemSchema = z.object({
  artistId: z.number().int().positive(),
  role: z.string().nullable(),
  active: z.boolean()
})

export const upsertCollectivePayloadSchema = z.object({
  collectiveId: z.number().int().positive(),
  fields: collectiveFormSchema,
  pendingAdds: z.array(memberDraftItemSchema),
  pendingUpdates: z.array(memberDraftItemSchema),
  pendingRemovals: z.array(z.number().int().positive())
})

export type CollectiveInsertInput = z.infer<typeof collectiveInsertSchema>
export type CollectiveUpdateInput = z.infer<typeof collectiveUpdateSchema>
export type CollectiveFormInput = z.infer<typeof collectiveFormSchema>
export type MemberDraftItemInput = z.infer<typeof memberDraftItemSchema>
export type UpsertCollectivePayloadInput = z.infer<
  typeof upsertCollectivePayloadSchema
>
