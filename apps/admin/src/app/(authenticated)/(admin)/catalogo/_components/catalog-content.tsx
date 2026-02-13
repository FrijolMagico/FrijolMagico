import { EmptyState } from '@/shared/components/empty-state'
import { getCatalogArtists } from '../_lib/get-catalog-data'
import { CatalogArtistsContainer } from './catalog-artists-container'

export async function CatalogContent() {
  const data = await getCatalogArtists()

  if (!data) {
    return (
      <div className='py-20'>
        <EmptyState
          title='No se encontraron artistas'
          description='No hay artistas que coincidan con los filtros aplicados.'
        />
      </div>
    )
  }

  return <CatalogArtistsContainer initialData={data} />
}
