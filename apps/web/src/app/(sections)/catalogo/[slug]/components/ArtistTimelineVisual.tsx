import type { CatalogArtist } from '../../types/catalog'

interface SortedEditionParticipation {
  año?: string | null
  edicion: string
  evento: string
  originalIndex: number
}

interface FestivalEditionGroup {
  editions: SortedEditionParticipation[]
  evento: string
}

const getYearSortValue = (año?: string | null): number => {
  const parsedYear = Number.parseInt(año ?? '', 10)
  return Number.isNaN(parsedYear) ? Number.MIN_SAFE_INTEGER : parsedYear
}

const groupFestivalParticipations = (
  editions: CatalogArtist['editions']
): FestivalEditionGroup[] => {
  const sortedEditions: SortedEditionParticipation[] = editions
    .map((edition, index) => ({
      ...edition,
      originalIndex: index
    }))
    .sort(
      (a, b) =>
        getYearSortValue(b.año) - getYearSortValue(a.año) ||
        a.originalIndex - b.originalIndex
    )

  const groupedFestivals = sortedEditions.reduce((groups, edition) => {
    const currentGroup = groups.get(edition.evento)
    if (currentGroup) {
      currentGroup.editions.push(edition)
      return groups
    }
    groups.set(edition.evento, {
      editions: [edition],
      evento: edition.evento
    })
    return groups
  }, new Map<string, FestivalEditionGroup>())

  return Array.from(groupedFestivals.values())
}

export interface ArtistTimelineVisualProps {
  editions: CatalogArtist['editions']
}

export const ArtistTimelineVisual = ({
  editions
}: ArtistTimelineVisualProps) => {
  const participations = groupFestivalParticipations(editions)

  if (participations.length === 0) return null

  return (
    <section>
      <h2 className='text-primary text-lg font-bold'>Festivales</h2>
      <ul className='space-y-4'>
        {participations.map((festival) => (
          <li key={festival.evento} className='ml-4'>
            <h3 className='text-secondary text-sm font-semibold'>
              {festival.evento}
            </h3>
            <ul className='mt-1.5 flex flex-wrap gap-1.5'>
              {festival.editions.map((edition) => (
                <li
                  key={`${festival.evento}-${edition.edicion}-${edition.año ?? 'sin-año'}`}
                >
                  <span className='bg-accent/10 text-accent inline-block rounded-full px-3 py-1 text-xs font-medium'>
                    {edition.edicion}
                    {edition.año && ` (${edition.año})`}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}
