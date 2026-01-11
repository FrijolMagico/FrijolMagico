import { mapPorDisciplina } from './disciplineMapper'

import type { FestivalEdicion } from '../../types/festival'

/**
 * Transforma una edición de festival raw (de DB) al formato de la aplicación.
 * Aplica mapeos necesarios como disciplina slug → label.
 */
export const mapFestivalEdicion = (raw: FestivalEdicion): FestivalEdicion => {
  return {
    ...raw,
    resumen: {
      ...raw.resumen,
      por_disciplina: mapPorDisciplina(raw.resumen.por_disciplina),
    },
  }
}
