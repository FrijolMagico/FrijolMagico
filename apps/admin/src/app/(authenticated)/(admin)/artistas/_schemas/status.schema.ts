import { artist } from '@frijolmagico/database/schema'
import { createSelectSchema } from 'drizzle-zod'
import z from 'zod'

const artistStatus = artist.artistStatus

export const artistStatusSelectSchema = createSelectSchema(artistStatus).omit({
  createdAt: true,
  updatedAt: true
})

export type ArtistStatus = z.infer<typeof artistStatusSelectSchema>
