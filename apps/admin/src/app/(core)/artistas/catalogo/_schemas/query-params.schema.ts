import { z } from 'zod'
import {
  paginationParamsSchema,
  searchParamsSchema
} from 'src/shared/schemas/query-params.schema'

export const catalogQueryParamsSchema = z
  .object({
    activo: z.boolean().nullable(),
    destacado: z.boolean().nullable()
  })
  .extend({
    ...paginationParamsSchema.shape,
    ...searchParamsSchema.shape
  })

export type CatalogQueryParams = z.infer<typeof catalogQueryParamsSchema>
