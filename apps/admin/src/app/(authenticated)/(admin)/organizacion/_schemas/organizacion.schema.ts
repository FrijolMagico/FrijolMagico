import { z } from 'zod'
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import { core } from '@frijolmagico/database/schema'

const { organization, organizationMember } = core

export const organizationInsertSchema = createInsertSchema(organization, {
  nombre: (s) => s.min(1, { message: 'El nombre es obligatorio' })
})

export const organizationUpdateSchema = createUpdateSchema(organization)

export const teamMemberInsertSchema = createInsertSchema(organizationMember, {
  organizationId: (s) => s.int().positive(),
  name: (s) => s.min(1, { message: 'El nombre es obligatorio' }),
  rrss: (s) =>
    s
      .transform((val: unknown) => {
        if (val && typeof val === 'object') return JSON.stringify(val)
        return val as string | null | undefined
      })
      .optional()
})

export const teamMemberUpdateSchema = createUpdateSchema(organizationMember)

/**
 * Schema Zod para el formulario de equipo (UI layer)
 * Acepta rrss como Record<string, string[]> | null para la interfaz de usuario
 */
export const memberFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  position: z.string().optional(),
  rut: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  rrss: z.record(z.string(), z.array(z.string())).nullable()
})

export const organizationSchema = organizationInsertSchema
export const teamMemberSchema = teamMemberInsertSchema

export type OrganizationInsertInput = z.infer<typeof organizationInsertSchema>
export type TeamMemberInsertInput = z.infer<typeof teamMemberInsertSchema>
export type MemberFormInput = z.infer<typeof memberFormSchema>

export type OrganizationInput = OrganizationInsertInput
export type TeamMemberInput = TeamMemberInsertInput

export const organizationFormSchema = organizationInsertSchema
  .pick({
    nombre: true,
    descripcion: true,
    mision: true,
    vision: true
  })
  .extend({
    nombre: z.string().min(1, { message: 'El nombre es obligatorio' })
  })

export type OrganizationFormInput = z.infer<typeof organizationFormSchema>
