import { z } from 'zod'
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import { core } from '@frijolmagico/database/schema'

const { organization, organizationMember } = core

export const organizacionInsertSchema = createInsertSchema(organization, {
  nombre: (s) => s.min(1, { message: 'El nombre es obligatorio' })
})

export const organizacionUpdateSchema = createUpdateSchema(organization)

export const organizacionEquipoInsertSchema = createInsertSchema(
  organizationMember,
  {
    organizationId: (s) => s.int().positive(),
    name: (s) => s.min(1, { message: 'El nombre es obligatorio' }),
    rrss: (s) =>
      s
        .transform((val: unknown) => {
          if (val && typeof val === 'object') return JSON.stringify(val)
          return val as string | null | undefined
        })
        .optional()
  }
)

export const organizacionEquipoUpdateSchema =
  createUpdateSchema(organizationMember)

/**
 * Schema Zod para el formulario de equipo (UI layer)
 * Acepta rrss como Record<string, string[]> | null para la interfaz de usuario
 */
export const equipoFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  position: z.string().optional(),
  rut: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  rrss: z.record(z.string(), z.array(z.string())).nullable()
})

export const organizacionSchema = organizacionInsertSchema
export const organizacionEquipoSchema = organizacionEquipoInsertSchema

export type OrganizacionInsertInput = z.infer<typeof organizacionInsertSchema>
export type OrganizacionEquipoInsertInput = z.infer<
  typeof organizacionEquipoInsertSchema
>
export type EquipoFormInput = z.infer<typeof equipoFormSchema>

export type OrganizacionInput = OrganizacionInsertInput
export type OrganizacionEquipoInput = OrganizacionEquipoInsertInput

export const organizacionFormSchema = organizacionInsertSchema
  .pick({
    nombre: true,
    descripcion: true,
    mision: true,
    vision: true
  })
  .extend({
    nombre: z.string().min(1, { message: 'El nombre es obligatorio' })
  })

export type OrganizacionFormInput = z.infer<typeof organizacionFormSchema>
