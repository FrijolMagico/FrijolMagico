import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'
import { core } from '@frijolmagico/database/schema'
import { rrssSchema, rutSchema } from '@/shared/schemas/person.schema'

const { organization, organizationMember } = core

export const organizationSelectSchema = createSelectSchema(organization)
export type Organization = z.infer<typeof organizationSelectSchema>

export const organizationInsertSchema = createInsertSchema(organization, {
  nombre: (s) => s.min(1, { message: 'El nombre es obligatorio' })
})
export type OrganizationInsertInput = z.infer<typeof organizationInsertSchema>
export const organizationUpdateSchema = createUpdateSchema(organization, {
  nombre: (s) => s.min(1, { message: 'El nombre es obligatorio' })
})

export const organizationFormSchema = organizationUpdateSchema
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

export const teamMemberSelectSchema = createSelectSchema(organizationMember, {
  rrss: z.record(z.string(), z.array(z.string())).nullable()
})

export type TeamMember = z.infer<typeof teamMemberSelectSchema>

export const teamMemberInsertSchema = createInsertSchema(organizationMember, {
  name: (s) => s.trim().min(1, { message: 'El nombre es obligatorio' }),
  rut: rutSchema,
  email: z
    .email('El email no es válido')
    .min(1, { message: 'El email es obligatorio' }),
  rrss: (s) =>
    s
      .transform((val: unknown) => {
        if (val && typeof val === 'object') return JSON.stringify(val)
        return val as string | null | undefined
      })
      .optional()
}).omit({ id: true, createdAt: true, updatedAt: true })

export type TeamMemberInsertInput = z.infer<typeof teamMemberInsertSchema>

export const teamMemberUpdateSchema = createUpdateSchema(organizationMember, {
  name: (s) => s.trim().min(1, { message: 'El nombre es obligatorio' }),
  rut: rutSchema,
  email: z
    .email('El email no es válido')
    .trim()
    .min(1, { message: 'El email es obligatorio' }),
  rrss: (s) =>
    s
      .transform((val: unknown) => {
        if (val && typeof val === 'object') return JSON.stringify(val)
        return val as string | null | undefined
      })
      .optional()
}).omit({
  createdAt: true,
  updatedAt: true
})

export type TeamMemberUpdateInput = z.infer<typeof teamMemberUpdateSchema>

export const teamMemberFormSchema = teamMemberSelectSchema
  .pick({
    name: true,
    rut: true,
    email: true,
    phone: true,
    position: true
  })
  .extend({
    name: z.string().trim().min(1, { message: 'El nombre es obligatorio' }),
    email: z
      .email('El email no es válido')
      .trim()
      .min(1, { message: 'El email es obligatorio' }),
    rrss: rrssSchema
  })

export type TeamMemberFormInput = z.infer<typeof teamMemberFormSchema>
