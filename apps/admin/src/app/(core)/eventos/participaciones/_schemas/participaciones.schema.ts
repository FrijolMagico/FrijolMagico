import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-zod'
import { participations } from '@frijolmagico/database/schema'

const { participationExhibition, participationActivity, activity } =
  participations

// ============================================
// Expositor (participacion_exposicion)
// ============================================

export const expositorInsertSchema = createInsertSchema(participationExhibition)
export const expositorUpdateSchema = createUpdateSchema(participationExhibition)

export const expositorFormSchema = z
  .object({
    artistaId: z.string().optional(),
    agrupacionId: z.string().optional(),
    eventoEdicionId: z.string().min(1),
    disciplinaId: z.string().min(1, {
      message: 'La disciplina es obligatoria'
    }),
    modoIngresoId: z.string().default('1'),
    notas: z.string().optional(),
    estado: z
      .enum([
        'seleccionado',
        'confirmado',
        'desistido',
        'cancelado',
        'ausente',
        'completado'
      ])
      .default('seleccionado')
  })
  .refine((data) => !!data.artistaId !== !!data.agrupacionId, {
    message: 'Debe especificar artista o agrupación, no ambos ni ninguno'
  })

// ============================================
// Actividad participante (participacion_actividad)
// ============================================

export const actividadInsertSchema = createInsertSchema(participationActivity)
export const actividadUpdateSchema = createUpdateSchema(participationActivity)

export const actividadFormSchema = z
  .object({
    artistaId: z.string().optional(),
    agrupacionId: z.string().optional(),
    bandaId: z.string().optional(),
    eventoEdicionId: z.string().min(1),
    tipoActividadId: z.string().min(1, {
      message: 'El tipo de actividad es obligatorio'
    }),
    modoIngresoId: z.string().default('2'),
    notas: z.string().optional(),
    estado: z
      .enum([
        'seleccionado',
        'confirmado',
        'desistido',
        'cancelado',
        'ausente',
        'completado'
      ])
      .default('seleccionado')
  })
  .refine(
    (data) =>
      [data.artistaId, data.agrupacionId, data.bandaId].filter(Boolean)
        .length === 1,
    {
      message:
        'Debe especificar artista, agrupación o banda, y solo uno de ellos'
    }
  )

// ============================================
// Actividad detalles (actividad)
// ============================================

export const actividadDetallesInsertSchema = createInsertSchema(activity)
export const actividadDetallesUpdateSchema = createUpdateSchema(activity)

export const actividadDetallesFormSchema = z.object({
  participacionActividadId: z.string().min(1),
  titulo: z.string().optional(),
  descripcion: z.string().optional(),
  duracionMinutos: z.coerce.number().int().positive().optional(),
  ubicacion: z.string().optional(),
  horaInicio: z.string().optional(),
  cupos: z.coerce.number().int().positive().optional()
})

// ============================================
// Type exports
// ============================================

export type ExpositorInsertInput = z.infer<typeof expositorInsertSchema>
export type ExpositorFormInput = z.infer<typeof expositorFormSchema>
export type ActividadInsertInput = z.infer<typeof actividadInsertSchema>
export type ActividadFormInput = z.infer<typeof actividadFormSchema>
export type ActividadDetallesInsertInput = z.infer<
  typeof actividadDetallesInsertSchema
>
export type ActividadDetallesFormInput = z.infer<
  typeof actividadDetallesFormSchema
>

export const editionParticipationSelectSchema = createSelectSchema(
  participations.editionParticipation
).omit({
  createdAt: true,
  updatedAt: true
})

export const participationExhibitionSelectSchema = createSelectSchema(
  participations.participationExhibition
).omit({
  createdAt: true,
  updatedAt: true
})

export const participationActivitySelectSchema = createSelectSchema(
  participations.participationActivity
).omit({
  createdAt: true,
  updatedAt: true
})

export const activitySelectSchema = createSelectSchema(
  participations.activity
).omit({
  createdAt: true,
  updatedAt: true
})

export type Participacion = z.infer<typeof editionParticipationSelectSchema>
export type Exposicion = z.infer<typeof participationExhibitionSelectSchema>
export type Actividad = z.infer<typeof participationActivitySelectSchema>
export type ActividadDetalle = z.infer<typeof activitySelectSchema>
