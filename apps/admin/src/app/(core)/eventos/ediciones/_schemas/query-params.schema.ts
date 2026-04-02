import { z } from 'zod'
import {
  paginationParamsSchema,
  searchParamsSchema
} from '@/shared/schemas/query-params.schema'

export const editionQueryParamsSchema = z.object({
  ...paginationParamsSchema.shape,
  ...searchParamsSchema.shape,
  evento: z.number().int().positive().nullable()
})

export type EditionsQueryParams = z.infer<typeof editionQueryParamsSchema>
