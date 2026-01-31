import { z } from 'zod'

/**
 * Schema para participación en un colectivo/agrupación
 */
export const CollectiveParticipationSchema = z.object({
  name: z.string(),
  edicion: z.string(),
  evento: z.string(),
})

/**
 * Schema para participación en una edición del festival
 */
export const EditionParticipationSchema = z.object({
  edicion: z.string(),
  evento: z.string(),
  año: z.string().nullable().optional(),
})

/**
 * Schema para validar datos raw de la base de datos.
 * Representa la estructura JSON retornada por la query SQL.
 */
export const CatalogArtistFromDBSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string().nullable(),
  email: z.string().nullable(),
  rrss: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  bio: z.string().nullable(),
  orden: z.string(),
  destacado: z.number(),
  avatar: z.string().nullable(),
  category: z.string().nullable(),
  collective: z.string().nullable(),
  collectives: z.array(CollectiveParticipationSchema),
  editions: z.array(EditionParticipationSchema),
})

/**
 * Schema para el resultado raw de la query (JSON string)
 */
export const RawCatalogResultSchema = z.object({
  resultado: z.string(),
})

export type CollectiveParticipation = z.infer<
  typeof CollectiveParticipationSchema
>
export type EditionParticipation = z.infer<typeof EditionParticipationSchema>
export type CatalogArtistFromDB = z.infer<typeof CatalogArtistFromDBSchema>
export type RawCatalogResult = z.infer<typeof RawCatalogResultSchema>
