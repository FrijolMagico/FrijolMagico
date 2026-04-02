import { z } from 'zod'
import {
  paginationParamsSchema,
  searchParamsSchema
} from '@/shared/schemas/query-params.schema'

export const collectiveQueryParamsSchema = z.object({
  ...paginationParamsSchema.shape,
  ...searchParamsSchema.shape,
  showDeleted: z.boolean().optional().default(false)
})

export type CollectiveQueryParams = z.infer<typeof collectiveQueryParamsSchema>
