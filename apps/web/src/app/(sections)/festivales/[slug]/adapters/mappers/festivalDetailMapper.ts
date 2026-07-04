import { getDisciplineLabel } from '@/app/(sections)/adapters/mappers/disciplineMapper'

import type { FestivalDetail, FestivalParticipant } from '../../../types/festival'

const mapParticipant = (
  participant: FestivalParticipant
): FestivalParticipant => {
  let disciplinaLabel: string

  try {
    disciplinaLabel = getDisciplineLabel(participant.disciplina_slug)
  } catch {
    disciplinaLabel = participant.disciplina_slug
  }

  return {
    ...participant,
    disciplina_slug: disciplinaLabel
  }
}

export const mapFestivalDetail = (raw: FestivalDetail): FestivalDetail => {
  return {
    ...raw,
    participantes: raw.participantes.map(mapParticipant)
  }
}
