import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'
import { artist as artistSchema } from '@frijolmagico/database/schema'
import { ARTIST_STATUS } from '../_constants'
import { rrssSchema } from '@/shared/schemas/person.schema'

const artistTable = artistSchema.artist

export const artistSelectSchema = createSelectSchema(artistTable, {
  rrss: rrssSchema,
  estadoId: z.number().transform((v) => v as ARTIST_STATUS)
}).omit({
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  slug: true
})

export const artistInsertSchema = createInsertSchema(artistTable, {
  pseudonimo: (s) => s.min(1, { error: 'El pseudónimo es obligatorio' }),
  estadoId: (s) => s.default(1),
  rrss: rrssSchema.transform((val) => {
    if (val && typeof val === 'object') return JSON.stringify(val) as string
    return val
  })
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
})

export const artistUpdateSchema = createUpdateSchema(artistTable, {
  pseudonimo: (s) => s.min(1, { error: 'El pseudónimo es obligatorio' }),
  rrss: rrssSchema.transform((val) => {
    if (val && typeof val === 'object') return JSON.stringify(val) as string
    return val
  })
}).omit({
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  slug: true
})

// Historial flags — tracks which fields to snapshot before update
export const historialFlagsSchema = z.object({
  pseudonimo: z.boolean(),
  correo: z.boolean(),
  ciudad: z.boolean(),
  pais: z.boolean(),
  rrss: z.boolean()
})

// Edit form schema — update fields (without id) + rrss as object + historial flags
export const artistUpdateFormSchema = artistUpdateSchema
  .extend({
    rrss: rrssSchema,
    historialFlags: historialFlagsSchema
  })
  .omit({ id: true })

export type Artist = z.infer<typeof artistSelectSchema>
export type ArtistInsertInput = z.infer<typeof artistInsertSchema>
export type ArtistUpdateInput = z.infer<typeof artistUpdateSchema>
export type HistorialFlags = z.infer<typeof historialFlagsSchema>
export type ArtistUpdateFormInput = z.infer<typeof artistUpdateFormSchema>
