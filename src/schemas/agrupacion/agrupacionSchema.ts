import { z } from 'zod'

/**
 * Schema completo de agrupacion (incluye id para SELECT)
 */
export const agrupacionSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string().min(1, 'Nombre es requerido'),
  descripcion: z.string().nullable(),
  correo: z
    .string()
    .email()
    .nullable()
    .or(z.literal(''))
    .transform((v) => v || null),
})

/**
 * Schema para INSERT (sin id)
 */
export const agrupacionInsertSchema = agrupacionSchema.omit({ id: true })

/**
 * Tipo inferido de agrupacion completa
 */
export type Agrupacion = z.infer<typeof agrupacionSchema>

/**
 * Tipo inferido para INSERT de agrupacion
 */
export type AgrupacionInsert = z.infer<typeof agrupacionInsertSchema>
