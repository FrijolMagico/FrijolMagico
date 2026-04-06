import { rrssSchema } from '@/shared/schemas/person.schema'
import { artist } from '@frijolmagico/database/schema'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import z from 'zod'

const artistHistoryTable = artist.artistHistory

export const artistHistorySelectSchema = createSelectSchema(
  artistHistoryTable,
  {
    rrss: rrssSchema
  }
).omit({
  createdAt: true,
  notas: true
})

export const artistHistoryInsertSchema = createInsertSchema(
  artistHistoryTable,
  {
    artistaId: () => z.coerce.number().int().positive(),
    rrss: () => z.string().nullable()
  }
)

export type ArtistHistory = z.infer<typeof artistHistorySelectSchema>
export type ArtistHistoryInsertInput = z.infer<typeof artistHistoryInsertSchema>
