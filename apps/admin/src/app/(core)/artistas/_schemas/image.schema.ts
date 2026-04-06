import { artist } from '@frijolmagico/database/schema'
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import z from 'zod'

const artistImageTable = artist.artistImage

export const artistImagenSelectSchema = createInsertSchema(artistImageTable, {})

export const artistImagenInsertSchema = createInsertSchema(artistImageTable, {
  artistaId: () => z.coerce.number().int().positive(),
  imagenUrl: (s) => s.min(1, { error: 'La URL de imagen es obligatoria' }),
  tipo: (s) => s as z.ZodType<'avatar' | 'galeria'>
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
})

export const artistImagenUpdateSchema = createUpdateSchema(artistImageTable)

export const artistImagenFormSchema = artistImagenInsertSchema
  .pick({
    artistaId: true,
    imagenUrl: true,
    tipo: true,
    orden: true,
    metadata: true
  })
  .extend({
    artistId: z.string().min(1, { message: 'El artista es obligatorio' }),
    imagenUrl: z.string().min(1, { message: 'La URL es obligatoria' })
  })

export type ArtistImagen = z.infer<typeof artistImagenSelectSchema>
export type ArtistImagenInsertInput = z.infer<typeof artistImagenInsertSchema>
export type ArtistImagenUpdateInput = z.infer<typeof artistImagenUpdateSchema>
export type ArtistImagenFormInput = z.infer<typeof artistImagenFormSchema>
