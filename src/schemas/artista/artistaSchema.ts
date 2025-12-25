import { z } from 'zod'

import { rrssObjectSchema, type RrssObject } from './rrssSchema'

/**
 * Schema completo de artista (incluye id para SELECT)
 * Refleja exactamente las constraints de la tabla artista en la DB
 *
 * Nota: rrss se guarda como JSON string en la DB pero se expone como objeto tipado
 */
export const artistaSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string().min(1, 'Nombre es requerido'),
  pseudonimo: z.string().nullable(),
  correo: z.preprocess(
    (v) => (v === '' ? null : v),
    z.string().email().nullable(),
  ),
  ciudad: z
    .string()
    .nullable()
    .transform((v) => v?.trim() || null),
  pais: z
    .string()
    .nullable()
    .transform((v) => v?.trim() || null),
  descripcion: z
    .string()
    .nullable()
    .transform((v) => v?.trim() || null),
  rrss: rrssObjectSchema.nullable(),
})

/**
 * Schema para INSERT (sin id, se genera automáticamente)
 */
export const artistaInsertSchema = artistaSchema.omit({ id: true })

/**
 * Tipo inferido de artista completo
 */
export type Artista = z.infer<typeof artistaSchema>

/**
 * Tipo inferido para INSERT de artista
 */
export type ArtistaInsert = z.infer<typeof artistaInsertSchema>

// Re-export RRSS types for convenience
export type { RrssObject }
