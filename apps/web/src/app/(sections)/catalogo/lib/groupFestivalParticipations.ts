import { getDisciplineLabel } from '@/app/(sections)/adapters/mappers/disciplineMapper'

import type { EditionParticipation } from '../schemas/catalogDBSchema'

export interface FestivalEditionCategory {
  key: string
  tipo_participacion: EditionParticipation['tipo_participacion']
  categoria: string
  label: string
  editions: EditionParticipation[]
}

export interface FestivalParticipationGroup {
  evento_id: number | string
  evento: string
  categories: FestivalEditionCategory[]
}

const getCategoryLabel = (
  tipoParticipacion: EditionParticipation['tipo_participacion'],
  categoria: string
): string => {
  if (tipoParticipacion === 'exhibicion') {
    return getDisciplineLabel(categoria)
  }

  return categoria
    .split(/[-_]/)
    .map((word) => word.charAt(0).toLocaleUpperCase('es') + word.slice(1))
    .join(' ')
}

const getYearSortValue = (año?: string | null): number => {
  const parsedYear = Number.parseInt(año ?? '', 10)
  return Number.isNaN(parsedYear) ? Number.MIN_SAFE_INTEGER : parsedYear
}

export const groupFestivalParticipations = (
  editions: EditionParticipation[]
): FestivalParticipationGroup[] => {
  const festivals = new Map<string | number, FestivalParticipationGroup>()
  const seenEditionKeys = new Set<string>()

  for (const edition of editions) {
    const festivalId = edition.evento_id ?? edition.evento
    const participationKind = edition.tipo_participacion ?? 'exhibicion'
    const categorySlug = edition.categoria ?? ''
    let festival = festivals.get(festivalId)

    if (!festival) {
      festival = {
        evento_id: festivalId,
        evento: edition.evento,
        categories: []
      }
      festivals.set(festivalId, festival)
    }

    const categoryKey = `${participationKind}:${categorySlug}`
    let category = festival.categories.find((item) => item.key === categoryKey)

    if (!category) {
      category = {
        key: categoryKey,
        tipo_participacion: participationKind,
        categoria: categorySlug,
        label: categorySlug
          ? getCategoryLabel(participationKind, categorySlug)
          : 'Participación',
        editions: []
      }
      festival.categories.push(category)
    }

    const editionKey = [
      festivalId,
      participationKind,
      categorySlug,
      edition.edicion,
      edition.año ?? ''
    ].join(':')

    if (!seenEditionKeys.has(editionKey)) {
      seenEditionKeys.add(editionKey)
      category.editions.push(edition)
    }
  }

  return Array.from(festivals.values()).map((festival) => ({
    ...festival,
    categories: festival.categories.map((category) => ({
      ...category,
      editions: category.editions
        .map((edition, index) => ({ edition, index }))
        .sort(
          (a, b) =>
            getYearSortValue(b.edition.año) - getYearSortValue(a.edition.año) ||
            a.index - b.index
        )
        .map(({ edition }) => edition)
    }))
  }))
}
