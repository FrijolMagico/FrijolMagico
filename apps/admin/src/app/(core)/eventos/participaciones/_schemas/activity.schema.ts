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
  ACTIVITY_TYPES,
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
  'startDate',
  'startTime',
  'endDate',
  'endTime'
] as const

const registrationInputSchema = z.object({
  url: z.string().trim().optional(),
  startDate: z.string().trim(),
  startTime: z.string().trim(),
  endDate: z.string().trim(),
  endTime: z.string().trim(),
  // UI-only field: controls visibility/validation of registration section
  registrationEnabled: z.boolean()
})

const validatedRegistrationSchema = registrationInputSchema.superRefine(
  (value, context) => {
    // If registration is disabled, no validation needed - transform will return null
    if (!value.registrationEnabled) return

    // registrationEnabled === true: all fields are required
    const filled = registrationFields.filter((field) => value[field] !== '')
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
    if (value.url) {
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
  validatedRegistrationSchema.transform((value) => {
    // If registration is disabled, return null (no registration in DB)
    if (!value.registrationEnabled) return null
    // registrationEnabled === true: return registration object (validated as complete)
    return value
  })

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

const occurrenceSchema = z.object({
  id: positiveIdSchema.optional(),
  date: z.string().refine((date) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
    try {
      Temporal.PlainDate.from(date, { overflow: 'reject' })
      return true
    } catch {
      return false
    }
  }, 'Ingresa una fecha de calendario válida'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Ingresa una hora válida (HH:mm)').or(z.literal('')).nullable().optional(),
  durationMinutes: z.number().int().positive('La duración debe ser positiva').nullable().optional(),
  url: z.string().trim().nullable().optional().refine((url) => {
    if (!url) return true
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'https:' && !parsed.username && !parsed.password
    } catch {
      return false
    }
  }, 'Ingresa una URL HTTPS válida')
})

export const activityOccurrencesSchema = z.array(occurrenceSchema).superRefine(
  (occurrences, context) => {
    const windows: { date: string; start: number; end: number }[] = []
    for (const [index, occurrence] of occurrences.entries()) {
      // Only validate time/duration if both are present
      const startTime = occurrence.startTime
      const duration = occurrence.durationMinutes
      if (startTime && duration != null) {
        const start = Number(startTime.slice(0, 2)) * 60 +
          Number(startTime.slice(3))
        if (start + duration > 1440) {
          context.addIssue({ code: 'custom', path: [index, 'durationMinutes'], message: 'La sesión no puede terminar después de medianoche' })
        }
        if (windows.some((window) => window.date === occurrence.date &&
          window.start < start + duration && start < window.end)) {
          context.addIssue({ code: 'custom', path: [index, 'startTime'], message: 'Las sesiones no pueden superponerse' })
        }
        windows.push({ date: occurrence.date, start, end: start + duration })
      }
    }
  }
)

export type ActivityOccurrenceInput = z.infer<typeof activityOccurrencesSchema>[number]

// Occurrence order is presentation-only; compare schedule and URL content, not persisted IDs.
export function sameActivitySchedule(
  left: ActivityOccurrenceInput[],
  right: ActivityOccurrenceInput[]
): boolean {
  const keys = (rows: ActivityOccurrenceInput[]) => rows
    .map(({ date, startTime, durationMinutes, url }) =>
      JSON.stringify([date, startTime ?? null, durationMinutes ?? null, url ?? null]))
    .sort()
  return JSON.stringify(keys(left)) === JSON.stringify(keys(right))
}

export function activityScheduleUpdate(
  original: ActivityOccurrenceInput[],
  desired: ActivityOccurrenceInput[],
  switchingToMusic: boolean
): { occurrences: ActivityOccurrenceInput[]; expectedOccurrences: ActivityOccurrenceInput[] } | Record<string, never> {
  const sameOccurrenceAssignments = (left: ActivityOccurrenceInput[], right: ActivityOccurrenceInput[]) => {
    const keys = (rows: ActivityOccurrenceInput[]) => rows
      .map(({ id, date, startTime, durationMinutes, url }) =>
        JSON.stringify([id ?? null, date, startTime ?? null, durationMinutes ?? null, url ?? null]))
      .sort()
    return JSON.stringify(keys(left)) === JSON.stringify(keys(right))
  }
  if (
    !switchingToMusic &&
    sameActivitySchedule(original, desired) &&
    sameOccurrenceAssignments(original, desired)
  ) return {}
  return { occurrences: desired, expectedOccurrences: original }
}

export function parseActivityOccurrencesInput(
  value: unknown,
  effectiveTypeSlug: string,
  requireDate = true
): ActivityOccurrenceInput[] {
  const occurrences = activityOccurrencesSchema.parse(value ?? [])
  const supportsOccurrences = ['taller', 'charla', 'musica'].includes(effectiveTypeSlug)
  if (!supportsOccurrences && occurrences.length) {
    throw new Error(
      'Este tipo de actividad no admite sesiones y no se puede crear o editar hasta que el modelo lo soporte'
    )
  }
  if (requireDate && supportsOccurrences && occurrences.length === 0) {
    throw new Error('Agregá al menos una fecha para la actividad')
  }
  return occurrences
}

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
    pseudonimoId: positiveIdSchema.nullable().optional(),
    participantType: z.enum(Object.values(PARTICIPANT_TYPE)),
    entity: editionParticipationEntitySchema,
    registration: validatedRegistrationSchema.optional(),
    occurrences: activityOccurrencesSchema.optional(),
    detail: activityDetailInsertSchema.omit({
      participacionActividadId: true,
      presenterNombre: true,
      presenterArtistaId: true,
      presenterPseudonimoId: true
    }).extend({
      presenterNombre: z.string().optional(),
      presenterArtistaId: positiveIdSchema.nullable().optional(),
      presenterPseudonimoId: positiveIdSchema.nullable().optional()
    })
  })
  .superRefine((value, context) => {
    const presenter = {
      presenterNombre: value.detail.presenterNombre,
      presenterArtistaId: value.detail.presenterArtistaId,
      presenterPseudonimoId: value.detail.presenterPseudonimoId
    }
    const isTalk = value.tipoActividadId === ACTIVITY_TYPES.CHARLA &&
      value.participantType !== PARTICIPANT_TYPE.BANDA
    validateActivityPresenterShape(presenter, context, ['detail'])
    if (!isTalk && hasActivityPresenter(presenter)) {
      context.addIssue({ code: 'custom', path: ['detail', 'presenterNombre'], message: 'Solo las charlas pueden tener presentador' })
    }
    const occurrences = value.occurrences ?? []
    if (occurrences.length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['occurrences'],
        message: 'Agregá al menos una fecha para la actividad'
      })
    }
    if (value.registration?.registrationEnabled) {
      occurrences.forEach((occurrence, index) => {
        if (!occurrence.url) {
          context.addIssue({
            code: 'custom',
            path: ['occurrences', index, 'url'],
            message: 'Agregá una URL de inscripción para cada sesión'
          })
        }
      })
    }
  })

type ActivityPresenterShape = {
  presenterNombre?: string | null
  presenterArtistaId?: number | null
  presenterPseudonimoId?: number | null
}

function hasActivityPresenter(presenter: ActivityPresenterShape): boolean {
  return Boolean(presenter.presenterNombre?.trim()) ||
    presenter.presenterArtistaId != null ||
    presenter.presenterPseudonimoId != null
}

function validateActivityPresenterShape(
  presenter: ActivityPresenterShape,
  context: z.RefinementCtx,
  path: (string | number)[]
) {
  const hasName = Boolean(presenter.presenterNombre?.trim())
  const hasArtist = presenter.presenterArtistaId != null
  const hasPseudonym = presenter.presenterPseudonimoId != null
  if ((hasName && (hasArtist || hasPseudonym)) || hasArtist !== hasPseudonym) {
    context.addIssue({
      code: 'custom',
      path: [...path, 'presenterArtistaId'],
      message: 'El presentador debe ser un nombre libre o un artista con pseudónimo'
    })
  }
}

const activityPresenterDatabaseSchema = z.object({
  presenterNombre: z.string().trim().min(1).nullable().default(null),
  presenterArtistaId: positiveIdSchema.nullable().default(null),
  presenterPseudonimoId: positiveIdSchema.nullable().default(null)
}).superRefine((presenter, context) => {
  validateActivityPresenterShape(presenter, context, [])
})

export function parseActivityPresenterDatabaseValues(value: unknown, isTalk: boolean) {
  const presenter = activityPresenterDatabaseSchema.parse(value)
  if (!isTalk && (presenter.presenterNombre !== null || presenter.presenterArtistaId !== null || presenter.presenterPseudonimoId !== null)) {
    throw new Error('Solo las charlas pueden tener presentador')
  }
  return presenter
}

export function activityPresenterDatabaseValues(
  presenter: Pick<
    ActivityFormInput['detail'],
    'presenterNombre' | 'presenterArtistaId' | 'presenterPseudonimoId'
  >,
  isTalk: boolean
) {
  const presenterNombre = presenter.presenterNombre?.trim() ?? ''
  if (!isTalk || !hasActivityPresenter(presenter)) {
    return {
      presenterNombre: null,
      presenterArtistaId: null,
      presenterPseudonimoId: null
    }
  }
  if (presenterNombre) {
    return {
      presenterNombre,
      presenterArtistaId: null,
      presenterPseudonimoId: null
    }
  }
  return {
    presenterNombre: null,
    presenterArtistaId: presenter.presenterArtistaId ?? null,
    presenterPseudonimoId: presenter.presenterPseudonimoId ?? null
  }
}

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
