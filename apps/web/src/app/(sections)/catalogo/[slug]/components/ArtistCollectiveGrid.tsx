import { CollectiveMemberLink } from '../../components/CollectiveMemberLink'

import type { CatalogArtist } from '../../types/catalog'

export interface ArtistCollectiveGridProps {
  artist: CatalogArtist
  catalogData: CatalogArtist[]
}

export const ArtistCollectiveGrid = ({
  artist,
  catalogData
}: ArtistCollectiveGridProps) => {
  if (!artist.collective) return null

  const members = catalogData.filter(
    (a) => a.collective === artist.collective && a.id !== artist.id
  )

  return (
    <section>
      <h2 className='text-primary text-lg font-bold'>Colectivo</h2>
      <p className='text-foreground/80 mb-3 text-sm'>{artist.collective}</p>

      {members.length > 0 ? (
        <ul className='flex flex-wrap gap-x-4 gap-y-1 text-sm'>
          {members.map((member) => (
            <li key={member.id}>
              <CollectiveMemberLink
                slug={member.slug ?? ''}
                name={member.name}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className='text-foreground/50 text-xs'>
          Sin otros miembros registrados.
        </p>
      )}
    </section>
  )
}
