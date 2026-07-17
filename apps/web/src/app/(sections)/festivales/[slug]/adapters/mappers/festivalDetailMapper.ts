import { getDisciplineLabel } from '@/app/(sections)/adapters/mappers/disciplineMapper'
import { getAvatarUrl } from '@frijolmagico/utils/cdn'

import type {
  FestivalDetail,
  FestivalParticipant
} from '../../../types/festival'

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
    disciplina_slug: disciplinaLabel,
    avatar_url: participant.catalogo_slug
      ? getAvatarUrl(participant.avatar_url ?? null)
      : null
  }
}

export const mapFestivalDetail = (raw: FestivalDetail): FestivalDetail => {
  return {
    ...raw,
    participantes: raw.participantes.map(mapParticipant)
  }
}
