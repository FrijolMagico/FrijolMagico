import { z } from 'zod'

const participationStatusValues = [
  'seleccionado',
  'confirmado',
  'desistido',
  'cancelado',
  'ausente',
  'completado'
] as const

export const participacionesQueryParamsSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  search: z.string(),
  edicion: z.string().nullable(),
  edicionId: z.string().nullable(),
  estado: z.enum(participationStatusValues).nullable()
})

export type ParticipacionesQueryParams = z.infer<
  typeof participacionesQueryParamsSchema
>
