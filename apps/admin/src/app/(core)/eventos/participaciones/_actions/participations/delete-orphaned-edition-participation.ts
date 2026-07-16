import 'server-only'

import { participations } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'

import type { Transaction } from '@frijolmagico/database/orm'

const { editionParticipation } = participations

export async function deleteOrphanedEditionParticipation(
  tx: Transaction,
  participationId: number
) {
  const exhibition = await tx.query.participationExhibition.findFirst({
    where: (table, { eq }) => eq(table.participacionId, participationId)
  })
  const activity = await tx.query.participationActivity.findFirst({
    where: (table, { eq }) => eq(table.participacionId, participationId)
  })

  if (exhibition || activity) return false

  await tx
    .delete(editionParticipation)
    .where(eq(editionParticipation.id, participationId))

  return true
}
