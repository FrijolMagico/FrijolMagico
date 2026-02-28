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
  name: z.string().min(1, { error: 'El nombre es obligatorio' }),
  position: z.string().optional(),
  rut: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  rrss: z.preprocess((val) => {
    if (val && typeof val === 'object') return JSON.stringify(val)
    return val
  }, z.string().optional())
})

/**
 * Schema Zod para el formulario de equipo (UI layer)
 * Acepta rrss como Record<string, string> | null para la interfaz de usuario
 */
export const equipoFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  position: z.string().optional(),
  rut: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  rrss: z.record(z.string(), z.array(z.string())).nullable()
})

export type OrganizacionInput = z.infer<typeof organizacionSchema>
export type OrganizacionEquipoInput = z.infer<typeof organizacionEquipoSchema>
export type EquipoFormInput = z.infer<typeof equipoFormSchema>
