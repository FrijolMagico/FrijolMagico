import {
  paginationParamsSchema,
  searchParamsSchema
} from '@/shared/schemas/query-params.schema'
import { z } from 'zod'

export const artistQueryParamsSchema = z
  .object({
    pais: z.string().nullable(),
    ciudad: z.string().nullable(),
    estado: z.number().min(1).max(5).nullable()
  })
  .extend({ ...paginationParamsSchema.shape, ...searchParamsSchema.shape })

export type ArtistQueryParams = z.infer<typeof artistQueryParamsSchema>
