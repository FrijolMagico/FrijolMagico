import { z } from 'zod'
import {
  paginationParamsSchema,
  searchParamsSchema
} from '@/shared/schemas/query-params.schema'

export const artistQueryParamsSchema = z.object({
  ...paginationParamsSchema.shape,
  ...searchParamsSchema.shape,
  pais: z.string().nullable(),
  ciudad: z.string().nullable(),
  estado: z.number().min(1).max(5).nullable()
})

export type ArtistQueryParams = z.infer<typeof artistQueryParamsSchema>
