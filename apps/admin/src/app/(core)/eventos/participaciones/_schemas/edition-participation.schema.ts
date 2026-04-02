import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'
import { participations } from '@frijolmagico/database/schema'
import { hasExactlyOneEntity } from '../_lib/participation-rules'

const { editionParticipation } = participations

// ============================================================================
// BASE DB SCHEMAS — Single Source of Truth
// ============================================================================

export const editionParticipationSelectSchema = createSelectSchema(
  editionParticipation
).omit({ createdAt: true, updatedAt: true })

export const editionParticipationInsertSchema = createInsertSchema(
  editionParticipation,
  {
    edicionId: z.int().positive({ message: 'La edición es obligatoria' })
  }
)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .refine(hasExactlyOneEntity, {
    message:
      'Debe haber exactamente una entidad asociada (artista, banda o agrupación)'
  })

export const editionParticipationUpdateSchema = createUpdateSchema(
  editionParticipation,
  {
    id: z.int().positive({ message: 'El ID de participación es obligatorio' }),
    edicionId: z.int().positive({ message: 'La edición es obligatoria' })
  }
)
  .omit({ createdAt: true, updatedAt: true })
  .refine(hasExactlyOneEntity, {
    message:
      'Debe haber exactamente una entidad asociada (artista, banda o agrupación)'
  })

// ============================================================================
// ENTITY-ONLY SCHEMA — Reusable entity validation
// ============================================================================

export const editionParticipationEntitySchema = editionParticipationSelectSchema
  .pick({ artistaId: true, bandaId: true, agrupacionId: true })
  .refine(hasExactlyOneEntity, {
    message:
      'Debe haber exactamente una entidad asociada (artista, banda o agrupación)'
  })

// ============================================================================
// EXPORTED TYPES
// ============================================================================

export type Participation = z.infer<typeof editionParticipationSelectSchema>
export type ParticipationEntity = z.infer<
  typeof editionParticipationEntitySchema
>
export type ParticipationInsertInput = z.infer<
  typeof editionParticipationInsertSchema
>
export type ParticipationUpdateInput = z.infer<
  typeof editionParticipationUpdateSchema
>
