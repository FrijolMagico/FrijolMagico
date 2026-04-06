import { z } from 'zod'

export const paginationParamsSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive()
})

export const searchParamsSchema = z.object({
  search: z.string()
})
