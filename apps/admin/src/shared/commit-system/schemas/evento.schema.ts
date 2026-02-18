import { z } from 'zod'

export const MODALIDAD = {
  PRESENCIAL: 'presencial',
  ONLINE: 'online',
  HIBRIDO: 'hibrido'
} as const

export type Modalidad = (typeof MODALIDAD)[keyof typeof MODALIDAD]

export const eventoSchema = z.object({
  id: z.number().int().positive().optional(),
  organizacionId: z.number().int().positive().optional(),
  nombre: z.string().min(1, { error: 'El nombre es obligatorio' }),
  slug: z.string().optional(),
  descripcion: z.string().optional()
})

export type EventoInput = z.infer<typeof eventoSchema>

export const eventoEdicionSchema = z.object({
  id: z.number().int().positive().optional(),
  eventoId: z.number().int().positive().optional(),
  nombre: z.string().optional(),
  numeroEdicion: z
    .string()
    .min(1, { error: 'El número de edición es obligatorio' }),
  slug: z.string().optional(),
  posterUrl: z.string().optional()
})

export type EventoEdicionInput = z.infer<typeof eventoEdicionSchema>

export const eventoEdicionDiaSchema = z.object({
  id: z.number().int().positive().optional(),
  eventoEdicionId: z
    .number()
    .int()
    .positive({ error: 'El ID de edición es obligatorio' }),
  lugarId: z.number().int().positive().optional(),
  fecha: z.string().min(1, { error: 'La fecha es obligatoria' }),
  horaInicio: z.string().min(1, { error: 'La hora de inicio es obligatoria' }),
  horaFin: z.string().min(1, { error: 'La hora de fin es obligatoria' }),
  modalidad: z.enum(['presencial', 'online', 'hibrido']).default('presencial')
})

export type EventoEdicionDiaInput = z.infer<typeof eventoEdicionDiaSchema>
