import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'
import { participations } from '@frijolmagico/database/schema'
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
    entity: editionParticipationEntitySchema
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
