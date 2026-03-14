import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'
import { artist } from '@frijolmagico/database/schema'

export const catalogSelectSchema = createSelectSchema(artist.catalogArtist)
  .extend({
    avatarUrl: z.url().nullable().optional()
  })
  .omit({
    createdAt: true,
    updatedAt: true
  })

export const catalogInsertSchema = createInsertSchema(artist.catalogArtist, {
  artistaId: (s) =>
    s.min(1, { error: 'El artista es obligatorio' }).nonoptional(),
  orden: (s) => s.min(1, { error: 'El orden es obligatorio' })
})
  .extend({
    avatarUrl: z.url().nullable().optional()
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
  })

export const catalogUpdateSchema = createUpdateSchema(artist.catalogArtist, {
  id: z.number()
})
  .pick({
    id: true,
    descripcion: true,
    activo: true,
    destacado: true,
    artistaId: true
  })
  .extend({
    avatarUrl: z.url().nullable()
  })

export const catalogFormSchema = catalogInsertSchema
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

export const catalogUpdateFormSchema = catalogUpdateSchema.omit({
  id: true
})

export const catalogFieldUpdateSchema = catalogUpdateSchema.pick({
  activo: true,
  destacado: true
})

export type Catalog = z.infer<typeof catalogSelectSchema>
export type CatalogoInsertInput = z.infer<typeof catalogInsertSchema>
export type CatalogoUpdateInput = z.infer<typeof catalogUpdateSchema>
export type CatalogoFormInput = z.infer<typeof catalogFormSchema>
export type CatalogUpdateFormInput = z.infer<typeof catalogUpdateFormSchema>
export type CatalogAddFormInput = Omit<CatalogoInsertInput, 'orden'>
export type AddCatalogFormInput = Omit<CatalogoInsertInput, 'orden'>
export type CatalogFieldUpdateInput = z.infer<typeof catalogFieldUpdateSchema>
