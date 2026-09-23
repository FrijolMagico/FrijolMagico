import { z } from 'zod'
import { Temporal } from '@js-temporal/polyfill'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'
import { participations } from '@frijolmagico/database/schema'
import { parseChileLocalInstant } from '../_lib/activity-registration-local'
import { editionParticipationEntitySchema } from './edition-participation.schema'
import {
  PARTICIPANT_TYPE,
  PARTICIPATION_STATUS
} from '../_constants/participations.constants'

const { participationActivity: activity, activity: activityDetail } =
  participations

const positiveIdSchema = z.number().int().positive()

// ============================================================================
// BASE DB SCHEMAS — Single Source of Truth
// ============================================================================

export const activitySelectSchema = createSelectSchema(activity).omit({
  createdAt: true,
  updatedAt: true
})

export const activityInsertSchema = createInsertSchema(activity, {
  tipoActividadId: (s) =>
    s.int().positive({ message: 'El tipo de actividad es obligatorio' }),
  modoIngresoId: (s) => s.int().positive().default(1)
}).omit({ id: true, createdAt: true, updatedAt: true })

export const activityUpdateSchema = createUpdateSchema(activity)
  .extend({
    id: positiveIdSchema,
    participacionId: positiveIdSchema
  })
  .omit({ createdAt: true, updatedAt: true })

export const activityDetailSelectSchema = createSelectSchema(
  activityDetail
).omit({
  createdAt: true,
  updatedAt: true
})

export const activityDetailInsertSchema = createInsertSchema(
  activityDetail
).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const activityDetailUpdateSchema = createUpdateSchema(activityDetail)
  .extend({
    id: positiveIdSchema
  })
  .omit({ createdAt: true, updatedAt: true })

// ============================================================================
// UI FORM SCHEMAS — Derived from DB Insert Schemas, pure DB types
// ============================================================================

const registrationFields = [
  'url',
  'startDate',
  'startTime',
  'endDate',
  'endTime'
] as const

const registrationInputSchema = z.object({
  url: z.string().trim(),
  startDate: z.string().trim(),
  startTime: z.string().trim(),
  endDate: z.string().trim(),
  endTime: z.string().trim()
})

const validatedRegistrationSchema = registrationInputSchema.superRefine(
  (value, context) => {
    const filled = registrationFields.filter((field) => value[field] !== '')
    if (filled.length === 0) return
    if (filled.length !== registrationFields.length) {
      for (const field of registrationFields) {
        if (!value[field])
          context.addIssue({
            code: 'custom',
            path: [field],
            message: 'Completa todos los campos de inscripción'
          })
      }
      return
    }
    try {
      const url = new URL(value.url)
      if (
        url.protocol !== 'https:' ||
        !url.hostname ||
        url.username ||
        url.password
      )
        throw new Error()
    } catch {
      context.addIssue({
        code: 'custom',
        path: ['url'],
        message: 'Ingresa una URL HTTPS válida'
      })
    }
    try {
      const start = parseChileLocalInstant(value.startDate, value.startTime)
      const end = parseChileLocalInstant(value.endDate, value.endTime)
      if (Temporal.Instant.compare(end, start) <= 0) {
        context.addIssue({
          code: 'custom',
          path: ['endDate'],
          message: 'El fin debe ser posterior al inicio'
        })
      }
    } catch {
      context.addIssue({
        code: 'custom',
        path: ['startDate'],
        message: 'Fecha u hora inválida o ambigua en Chile'
      })
    }
  }
)

export const activityRegistrationFormSchema =
  validatedRegistrationSchema.transform((value) =>
    registrationFields.every((field) => !value[field]) ? null : value
  )

export function parseActivityRegistrationInput(
  value: unknown,
  effectiveTypeSlug: string
) {
  const registration =
    value == null ? null : activityRegistrationFormSchema.parse(value)
  if (registration !== null && effectiveTypeSlug === 'musica') {
    throw new Error('No se permite inscripción para actividades de música')
  }
  return registration
}

export type ActivityRegistrationInput = Exclude<
  z.infer<typeof activityRegistrationFormSchema>,
  null
>

// Base object schema (no refine) — shared between form and dialog schemas
// modoIngresoId is overridden to remove .default() so RHF input/output types match
export const activityFormSchema = activityInsertSchema
  .omit({
    postulacionId: true,
    participacionId: true
  })
  .extend({
    modoIngresoId: positiveIdSchema,
    estado: z.enum(Object.values(PARTICIPATION_STATUS)),
    detail: activityDetailInsertSchema.omit({
      participacionActividadId: true
    }),
    participantType: z.enum(Object.values(PARTICIPANT_TYPE)),
    entity: editionParticipationEntitySchema,
    registration: validatedRegistrationSchema.optional()
  })

// ============================================================================
// EXPORTED TYPES
// ============================================================================

export type Activity = z.infer<typeof activitySelectSchema>
export type ActivityInsertInput = z.infer<typeof activityInsertSchema>
export type ActivityUpdateInput = z.infer<typeof activityUpdateSchema>

export type ActivityDetail = z.infer<typeof activityDetailSelectSchema>
export type ActivityDetailInsertInput = z.infer<
  typeof activityDetailInsertSchema
>
export type ActivityDetailUpdateInput = z.infer<
  typeof activityDetailUpdateSchema
>

export type ActivityFormInput = z.infer<typeof activityFormSchema>
