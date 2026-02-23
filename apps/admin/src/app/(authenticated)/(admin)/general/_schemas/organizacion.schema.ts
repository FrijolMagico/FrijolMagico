import { z } from 'zod'

export const organizacionSchema = z.object({
  id: z.number().int().positive().optional(),
  nombre: z.string().min(1, { error: 'El nombre es obligatorio' }),
  descripcion: z.string().optional(),
  mision: z.string().optional(),
  vision: z.string().optional()
})

export const organizacionEquipoSchema = z.object({
  id: z.number().int().positive().optional(),
  organizationId: z
    .number()
    .int()
    .positive({ error: 'organizationId debe ser un entero positivo' }),
  nombre: z.string().min(1, { error: 'El nombre es obligatorio' }),
  cargo: z.string().optional(),
  rut: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  rrss: z.string().optional()
})

/**
 * Schema Zod para el formulario de equipo (UI layer)
 * Acepta rrss como Record<string, string> | null para la interfaz de usuario
 */
export const equipoFormSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  cargo: z.string().optional(),
  rut: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  rrss: z.record(z.string(), z.string()).nullable().optional()
})

export type OrganizacionInput = z.infer<typeof organizacionSchema>
export type OrganizacionEquipoInput = z.infer<typeof organizacionEquipoSchema>
export type EquipoFormInput = z.infer<typeof equipoFormSchema>
