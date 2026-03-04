import { z } from 'zod'

/**
 * Schema Zod para la tabla evento_edicion (server validation)
 * Mapea desde Drizzle schema (packages/database/src/db/schema/events.ts)
 */
export const edicionSchema = z.object({
  id: z.number().int().positive().optional(), // Optional for inserts (auto-increment)
  eventoId: z.coerce
    .number()
    .int()
    .positive({ error: 'eventoId debe ser un entero positivo' }),
  nombre: z.string().optional(),
  numeroEdicion: z
    .string()
    .min(1, { error: 'El número de edición es obligatorio' }),
  slug: z.string().min(1, { error: 'El slug es obligatorio' }),
  posterUrl: z.string().optional()
})

/**
 * Schema Zod para el formulario de edición (client validation)
 * Versión simplificada para UI forms
 */
export const edicionFormSchema = z.object({
  eventoId: z.string().min(1, { error: 'El evento es obligatorio' }),
  nombre: z.string().optional(),
  numeroEdicion: z
    .string()
    .min(1, { error: 'El número de edición es obligatorio' }),
  posterUrl: z.string().optional()
})

/**
 * Schema Zod para la tabla evento_edicion_dia (server validation)
 * Mapea desde Drizzle schema (packages/database/src/db/schema/events.ts)
 */
export const edicionDiaSchema = z.object({
  id: z.number().int().positive().optional(),
  eventoEdicionId: z.union([
    z
      .number()
      .int()
      .positive({ error: 'eventoEdicionId debe ser un entero positivo' }),
    z.string().min(1)
  ]),
  lugarId: z
    .union([
      z
        .number()
        .int()
        .positive({ error: 'lugarId debe ser un entero positivo' }),
      z.string().min(1)
    ])
    .optional(),
  fecha: z.string({ error: 'La fecha es obligatoria' }),
  horaInicio: z.string({ error: 'La hora de inicio es obligatoria' }),
  horaFin: z.string({ error: 'La hora de fin es obligatoria' }),
  modalidad: z.enum(['presencial', 'online', 'hibrido'], {
    error: "La modalidad debe ser 'presencial', 'online' o 'hibrido'"
  })
})

/**
 * Schema Zod para el formulario de día de edición (client validation)
 * Versión simplificada para UI forms
 */
export const edicionDiaFormSchema = z.object({
  fecha: z.string({ error: 'La fecha es obligatoria' }),
  horaInicio: z.string({ error: 'La hora de inicio es obligatoria' }),
  horaFin: z.string({ error: 'La hora de fin es obligatoria' }),
  modalidad: z.enum(['presencial', 'online', 'hibrido'], {
    error: "La modalidad debe ser 'presencial', 'online' o 'hibrido'"
  }),
  lugarId: z
    .number()
    .int()
    .positive({ error: 'lugarId debe ser un entero positivo' })
    .optional()
})

/**
 * Schema Zod para la tabla lugar (server validation)
 * Mapea desde Drizzle schema (packages/database/src/db/schema/core.ts)
 */
export const lugarSchema = z.object({
  id: z.number().int().positive().optional(), // Optional for inserts (auto-increment)
  nombre: z.string().min(1, { error: 'El nombre es obligatorio' }),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  coordenadas: z.string().optional(),
  url: z.url({ message: 'La URL debe ser válida' }).optional()
})

/**
 * Schema Zod para el formulario de lugar (client validation)
 * Versión simplificada para UI forms
 */
export const lugarFormSchema = z.object({
  nombre: z.string().min(1, { error: 'El nombre es obligatorio' }),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  coordenadas: z.string().optional(),
  url: z.url({ message: 'La URL debe ser válida' }).optional()
})

/**
 * Tipos TypeScript inferidos desde schemas Zod
 */
export type EdicionInput = z.infer<typeof edicionSchema>
export type EdicionFormInput = z.infer<typeof edicionFormSchema>
export type EdicionDiaInput = Omit<
  z.infer<typeof edicionDiaSchema>,
  'eventoEdicionId' | 'lugarId'
> & {
  eventoEdicionId: number
  lugarId?: number
}
export type EdicionDiaFormInput = z.infer<typeof edicionDiaFormSchema>
export type LugarInput = z.infer<typeof lugarSchema>
export type LugarFormInput = z.infer<typeof lugarFormSchema>
