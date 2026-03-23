import { z } from 'zod'
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import { artist } from '@frijolmagico/database/schema'

const { collectiveArtist } = artist

export const memberInsertSchema = createInsertSchema(collectiveArtist).omit({
  createdAt: true
})

export const memberUpdateSchema = createUpdateSchema(collectiveArtist).omit({
  createdAt: true
})

export const memberFormSchema = z.object({
  agrupacionId: z.string().min(1, { error: 'La agrupación es obligatoria' }),
  artistaId: z.string().min(1, { error: 'El artista es obligatorio' }),
  rol: z.string().optional(),
  activo: z.boolean().default(true)
})

export const memberRemoveSchema = z.object({
  agrupacionId: z.number().int().positive(),
  artistaId: z.number().int().positive()
})

export const memberActionSchema = z.object({
  agrupacionId: z.number().int().positive(),
  artistaId: z.number().int().positive(),
  rol: z.string().nullable().optional(),
  activo: z.boolean()
})

export type MemberInsertInput = z.infer<typeof memberInsertSchema>
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>
export type MemberFormInput = z.infer<typeof memberFormSchema>
