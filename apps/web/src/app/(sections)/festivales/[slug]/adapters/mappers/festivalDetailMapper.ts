import { getDisciplineLabel } from '@/app/(sections)/adapters/mappers/disciplineMapper'
import { getAvatarUrl, getPosterUrl } from '@frijolmagico/utils/cdn'

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
  const editionEnd = raw.edicion_fin ? new Date(raw.edicion_fin + 'T23:59:59') : null
  const isEditionPast = editionEnd ? editionEnd < new Date() : false

  return {
    ...raw,
    is_edition_past: isEditionPast,
    poster_url: getPosterUrl(raw.poster_url),
    participantes: raw.participantes.map(mapParticipant),
    actividades: raw.actividades.map((activity) => ({
      ...activity,
      ocurrencias: [...activity.ocurrencias].sort(
        (a, b) =>
          a.fecha.localeCompare(b.fecha) ||
          (a.hora_inicio ?? '99:99').localeCompare(b.hora_inicio ?? '99:99') ||
          (a.id ?? 0) - (b.id ?? 0)
      ),
      catalogo_slug: activity.catalogo_slug ?? null,
      avatar_url: activity.catalogo_slug
        ? getAvatarUrl(activity.avatar_url ?? null)
        : null,
      rrss: activity.rrss ?? null,
      correo: activity.correo ?? null,
      presenter_nombre: activity.presenter_nombre ?? null,
      presenter_catalogo_slug: activity.presenter_catalogo_slug ?? null,
      registration: activity.registration ?? null
    }))
  }
}
