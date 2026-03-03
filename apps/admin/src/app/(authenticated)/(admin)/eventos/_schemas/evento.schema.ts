import { z } from 'zod'

/**
 * Schema Zod para la tabla evento (server validation)
 * Mapea desde Drizzle schema (packages/database/src/db/schema/events.ts)
 */
export const eventoSchema = z.object({
  id: z.number().int().positive().optional(), // Optional for inserts (auto-increment)
  organizacionId: z
    .number()
    .int()
    .positive({ error: 'organizacionId debe ser un entero positivo' })
    .default(1),
  nombre: z.string().min(1, { error: 'El nombre es obligatorio' }),
  slug: z.string().min(1, { error: 'El slug es obligatorio' }),
  descripcion: z.string().optional()
})

/**
 * Schema Zod para el formulario de evento (client validation)
 * Versión simplificada para UI forms
 */
export const eventoFormSchema = z.object({
  nombre: z.string().min(1, { error: 'El nombre es obligatorio' }),
  descripcion: z.string().optional()
})

/**
 * Tipos TypeScript inferidos desde schemas Zod
 */
export type EventoInput = z.infer<typeof eventoSchema>
export type EventoFormInput = z.infer<typeof eventoFormSchema>
