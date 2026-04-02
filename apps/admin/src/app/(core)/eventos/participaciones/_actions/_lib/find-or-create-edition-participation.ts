import 'server-only'

import { participations } from '@frijolmagico/database/schema'

import type { Transaction } from '@frijolmagico/database/orm'
import { ParticipationInsertInput } from '../../_schemas/edition-participation.schema'

const { editionParticipation } = participations

function hasValue(value: number | null | undefined): value is number {
  return value !== null && value !== undefined
}

export async function findOrCreateEditionParticipation(
  tx: Transaction,
  input: ParticipationInsertInput
) {
  const selectedParticipants = [
    input.artistaId,
    input.agrupacionId,
    input.bandaId
  ].filter(hasValue)

  if (selectedParticipants.length !== 1) {
    throw new Error(
      'findOrCreateEditionParticipation requires exactly one participant entity'
    )
  }

  const participationRecord = await tx.query.editionParticipation.findFirst({
    where: (table, { and, eq }) => {
      if (hasValue(input.artistaId)) {
        return and(
          eq(table.edicionId, input.edicionId),
          eq(table.artistaId, input.artistaId)
        )
      }

      if (hasValue(input.agrupacionId)) {
        return and(
          eq(table.edicionId, input.edicionId),
          eq(table.agrupacionId, input.agrupacionId)
        )
      }

      return and(
        eq(table.edicionId, input.edicionId),
        eq(table.bandaId, input.bandaId!)
      )
    }
  })

  if (participationRecord) {
    return participationRecord
  }

  const [insertedParticipation] = await tx
    .insert(editionParticipation)
    .values({
      edicionId: input.edicionId,
      artistaId: input.artistaId ?? null,
      agrupacionId: input.agrupacionId ?? null,
      bandaId: input.bandaId ?? null
    })
    .returning({ id: editionParticipation.id })

  return insertedParticipation
}
