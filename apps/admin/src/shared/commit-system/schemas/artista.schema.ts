import { z } from 'zod'

/**
 * Schema Zod para la tabla artista
 * Mapea desde Drizzle schema (packages/database/src/db/schema/artist.ts)
 */
export const artistaSchema = z.object({
  id: z.number().int().positive().optional(), // Optional for inserts (auto-increment)
  estadoId: z
    .number()
    .int()
    .positive({ error: 'estadoId debe ser un entero positivo' })
    .default(1),
  nombre: z.string().optional(),
  pseudonimo: z.string().min(1, { error: 'El pseudónimo es obligatorio' }),
  slug: z.string().min(1, { error: 'El slug es obligatorio' }),
  rut: z.string().optional(),
  correo: z.string().optional(),
  rrss: z.string().optional(),
  ciudad: z.string().optional(),
  pais: z.string().optional()
})

/**
 * Schema Zod para la tabla artista_imagen
 * Mapea desde Drizzle schema (packages/database/src/db/schema/artist.ts)
 */
export const artistaImagenSchema = z.object({
  id: z.number().int().positive().optional(), // Optional for inserts (auto-increment)
  artistaId: z
    .number()
    .int()
    .positive({ error: 'artistaId debe ser un entero positivo' }),
  imagenUrl: z.string().min(1, { error: 'La URL de imagen es obligatoria' }),
  tipo: z.enum(['avatar', 'galeria'], {
    error: "El tipo debe ser 'avatar' o 'galeria'"
  }),
  orden: z
    .number()
    .int()
    .positive({ error: 'orden debe ser un entero positivo' })
    .default(1),
  metadata: z.string().optional()
})

/**
 * Schema Zod para la tabla catalogo_artista
 * Mapea desde Drizzle schema (packages/database/src/db/schema/artist.ts)
 */
export const catalogoArtistaSchema = z.object({
  id: z.number().int().positive().optional(), // Optional for inserts (auto-increment)
  artistaId: z
    .number()
    .int()
    .positive({ error: 'artistaId debe ser un entero positivo' }),
  orden: z.string().min(1, { error: 'El orden es obligatorio' }),
  destacado: z
    .boolean({ error: 'destacado debe ser un booleano' })
    .default(false),
  activo: z.boolean({ error: 'activo debe ser un booleano' }).default(true),
  descripcion: z.string().optional()
})

/**
 * Tipos TypeScript inferidos desde schemas Zod
 */
export type ArtistaInput = z.infer<typeof artistaSchema>
export type ArtistaImagenInput = z.infer<typeof artistaImagenSchema>
export type CatalogoArtistaInput = z.infer<typeof catalogoArtistaSchema>
