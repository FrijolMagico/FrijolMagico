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
  organizacionId: z
    .number()
    .int()
    .positive({ error: 'organizacionId debe ser un entero positivo' }),
  nombre: z.string().min(1, { error: 'El nombre es obligatorio' }),
  cargo: z.string().optional(),
  rrss: z.string().optional()
})

export type OrganizacionInput = z.infer<typeof organizacionSchema>
export type OrganizacionEquipoInput = z.infer<typeof organizacionEquipoSchema>
