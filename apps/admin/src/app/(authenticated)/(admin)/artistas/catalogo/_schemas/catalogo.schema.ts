import { z } from 'zod'
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import { artist } from '@frijolmagico/database/schema'

export const catalogoArtistaInsertSchema = createInsertSchema(
  artist.catalogArtist,
  {
    artistaId: (s) =>
      s.int().positive().min(1, { error: 'El artista es obligatorio' }),
    orden: (s) => s.min(1, { error: 'El orden es obligatorio' })
  }
)

export const catalogoArtistaUpdateSchema = createUpdateSchema(
  artist.catalogArtist
)

export type CatalogoArtistaInsertInput = z.infer<
  typeof catalogoArtistaInsertSchema
>

export const catalogoArtistaFormSchema = catalogoArtistaInsertSchema
  .pick({
    artistaId: true,
    orden: true,
    descripcion: true
  })
  .extend({
    artistaId: z.string().min(1, { message: 'El artista es obligatorio' }),
    destacado: z.boolean().default(false),
    activo: z.boolean().default(true)
  })

export type CatalogoArtistaFormInput = z.infer<typeof catalogoArtistaFormSchema>
