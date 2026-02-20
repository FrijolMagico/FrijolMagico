import { EmptyState } from '@/shared/components/empty-state'
import { getCatalogData } from '../_lib/get-catalog-data'
import { CatalogArtistsContainer } from './catalog-artists-container'

export async function CatalogContent() {
  const catalog = await getCatalogData()

  if (!catalog || catalog.length === 0) {
    return (
      <div className='py-20'>
        <EmptyState
          title='No se encontraron artistas'
          description='No hay artistas que coincidan con los filtros aplicados.'
        />
      </div>
    )
  }

  return <CatalogArtistsContainer initialData={catalog} />
}
