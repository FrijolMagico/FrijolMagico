import { z } from 'zod'
import { PARTICIPATION_STATUSES } from '../_constants/participations.constants'
import { searchParamsSchema } from '@/shared/schemas/query-params.schema'

export const participationsQueryParamsSchema = z.object({
  ...searchParamsSchema.shape,
  edicion: z.string().nullable(),
  estado: z.enum(PARTICIPATION_STATUSES).nullable()
})

export type ParticipationsQueryParams = z.infer<
  typeof participationsQueryParamsSchema
>
