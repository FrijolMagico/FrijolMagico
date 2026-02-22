import { z } from 'zod'

/**
 * Schema Zod para la tabla catalogo_artista
 * Mapea desde Drizzle schema (packages/database/src/db/schema/artist.ts)
 *
 * Nota: catalogoArtista está en artist.ts en Drizzle, pero conceptualmente
 * pertenece a la sección catalogo-entry.
 */
export const catalogoArtistaSchema = z.object({
  id: z.number().int().positive().optional(), // Optional for inserts (auto-increment)
  artistaId: z
    .number()
    .int()
    .positive()
    .min(1, { error: 'El artista es obligatorio' }),
  orden: z.string().min(1, { error: 'El orden es obligatorio' }),
  destacado: z
    .boolean({ error: 'destacado debe ser un booleano' })
    .default(false),
  activo: z.boolean({ error: 'activo debe ser un booleano' }).default(true),
  descripcion: z.string().optional()
})

/**
 * Tipos TypeScript inferidos desde schema Zod
 */
export type CatalogoArtistaInput = z.infer<typeof catalogoArtistaSchema>
