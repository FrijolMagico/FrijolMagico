/**
 * Mapeo de slugs de disciplina a labels de presentación.
 * Los slugs corresponden a la columna `slug` en la tabla `disciplina`.
 */
export const DISCIPLINE_LABELS: Record<string, string> = {
  ilustracion: 'Ilustración',
  'narrativa-grafica': 'Narrativa Gráfica',
  manualidades: 'Manualidades',
  fotografia: 'Fotografía',
}

/**
 * Obtiene el label de presentación para una disciplina.
 * @throws Error si el slug no existe en DISCIPLINE_LABELS
 */
export const getDisciplineLabel = (slug: string): string => {
  const label = DISCIPLINE_LABELS[slug]
  if (!label) {
    throw new Error(
      `Unknown discipline slug: "${slug}". Add it to DISCIPLINE_LABELS in disciplineMapper.ts`,
    )
  }
  return label
}

/**
 * Transforma un Record de disciplinas con slugs como keys a labels como keys.
 */
export const mapPorDisciplina = (
  porDisciplina: Record<string, number>,
): Record<string, number> => {
  return Object.fromEntries(
    Object.entries(porDisciplina).map(([slug, count]) => [
      getDisciplineLabel(slug),
      count,
    ]),
  )
}
