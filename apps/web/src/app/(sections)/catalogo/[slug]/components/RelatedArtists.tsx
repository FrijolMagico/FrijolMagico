import type { CatalogArtist } from '../../types/catalog'
import { ArtistCard } from '@/components/ArtistCard'
import { getRelatedArtists } from '../lib/getRelatedArtists'

export interface RelatedArtistsProps {
  artist: CatalogArtist
  catalogData: CatalogArtist[]
}

export const RelatedArtists = ({
  artist,
  catalogData
}: RelatedArtistsProps) => {
  const related = getRelatedArtists(artist, catalogData, 4)

  if (related.length === 0) return null

  return (
    <section className='container mx-auto max-w-4xl py-12'>
      <h2 className='text-primary mb-6 text-2xl font-bold'>
        Artistas Relacionados
      </h2>

      <ul className='mx-auto grid w-fit grid-cols-1 items-end gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {related.map((relatedArtist) => (
          <li key={relatedArtist.id}>
            <ArtistCard
              artist={{
                pseudonimo: relatedArtist.name,
                imagen_url: relatedArtist.avatar,
                slug: relatedArtist.slug ?? ''
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
