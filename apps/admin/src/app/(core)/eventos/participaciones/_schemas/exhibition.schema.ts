import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'
import { participations } from '@frijolmagico/database/schema'
import { editionParticipationSelectSchema } from './edition-participation.schema'
import {
  DISCIPLINE_IDS,
  ENTRY_MODE_IDS,
  PARTICIPANT_TYPE,
  PARTICIPATION_STATUS
} from '../_constants/participations.constants'
import { hasExactlyOneEntity } from '../_lib/participation-rules'

const { participationExhibition } = participations

const positiveIdSchema = z.number().int().positive()
const disciplineIdSchema = z.union(
  DISCIPLINE_IDS.map((id) => z.literal(id)),
  {
    message: 'Disciplina inválida'
  }
)

const entryModeIdSchema = z.union(
  ENTRY_MODE_IDS.map((id) => z.literal(id)),
  {
    message: 'Modo de ingreso inválido'
  }
)

export const exhibitionParticipantTypes = ['artista', 'agrupacion'] as const

// ============================================================================
// BASE DB SCHEMAS — Single Source of Truth
// ============================================================================

export const participationExhibitionSelectSchema = createSelectSchema(
  participationExhibition,
  {
    disciplinaId: disciplineIdSchema,
    modoIngresoId: entryModeIdSchema
  }
).omit({ createdAt: true, updatedAt: true })

export const exhibitionInsertSchema = createInsertSchema(
  participationExhibition,
  {
    participacionId: positiveIdSchema,
    disciplinaId: disciplineIdSchema,
    modoIngresoId: entryModeIdSchema
  }
).omit({ id: true, createdAt: true, updatedAt: true })

export const exhibitionUpdateSchema = createUpdateSchema(
  participationExhibition,
  {
    id: positiveIdSchema,
    participacionId: positiveIdSchema,
    disciplinaId: disciplineIdSchema,
    modoIngresoId: entryModeIdSchema
  }
).omit({ createdAt: true, updatedAt: true })

// ============================================================================
// UI FORM SCHEMAS — Derived from DB Insert Schemas, pure DB types
// ============================================================================

export const exhibitionFormSchema = exhibitionInsertSchema
  .omit({
    postulacionId: true,
    participacionId: true
  })
  .extend({
    estado: z.enum(Object.values(PARTICIPATION_STATUS)),
    participantType: z.enum(Object.values(PARTICIPANT_TYPE)),
    entity: editionParticipationSelectSchema
      .pick({ artistaId: true, agrupacionId: true })
      .refine(hasExactlyOneEntity, {
        message:
          'Debe haber exactamente una entidad asociada (artista, banda o agrupación)'
      })
  })

// ============================================================================
// EXPORTED TYPES
// ============================================================================

export type Exhibition = z.infer<typeof participationExhibitionSelectSchema>
export type ExhibitionInsertInput = z.infer<typeof exhibitionInsertSchema>
export type ExhibitionUpdateInput = z.infer<typeof exhibitionUpdateSchema>
export type ExhibitionFormInput = z.infer<typeof exhibitionFormSchema>
