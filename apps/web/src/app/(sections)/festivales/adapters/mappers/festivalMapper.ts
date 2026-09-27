import { mapPorDisciplina } from '@/app/(sections)/adapters/mappers/disciplineMapper'
import { getPosterUrl } from '@frijolmagico/utils/cdn'

import type { FestivalEdicion } from '../../types/festival'

/**
 * Transforma una edición de festival raw (de DB) al formato de la aplicación.
 * Aplica mapeos necesarios como disciplina slug → label.
 */
export const mapFestivalEdicion = (raw: FestivalEdicion): FestivalEdicion => {
  return {
    ...raw,
    evento: {
      ...raw.evento,
      poster_url: getPosterUrl(raw.evento.poster_url)
    },
    resumen: {
      ...raw.resumen,
      por_disciplina: mapPorDisciplina(raw.resumen.por_disciplina)
    }
  }
}
