import { SearchParamsProps } from '@/shared/types/search-params'
import { CatalogContainer } from './_components/catalog-container'
import { getCatalogData, getArtistsNotInCatalog } from './_lib/get-catalog-data'
import { getDeletedCatalog } from './_lib/get-deleted-catalog'
import { loadCatalogQueryParams } from './_lib/search-params'

export default async function CatalogArtistsPage({
  searchParams
}: SearchParamsProps) {
  const params = await loadCatalogQueryParams(searchParams)

  const [{ data, ...pagination }, availableArtists, deletedCatalog] =
    await Promise.all([
      getCatalogData(params),
      getArtistsNotInCatalog(),
      getDeletedCatalog()
    ])

  return (
    <article className='h-full min-h-max space-y-6'>
      <header>
        <h1 className='text-foreground text-2xl font-bold'>
          Catálogo de Artistas
        </h1>
        <p className='text-muted-foreground'>
          Gestiona los artistas que aparecen en el catálogo público.
        </p>
      </header>

      <CatalogContainer
        catalog={data}
        deletedCatalog={deletedCatalog}
        availableArtists={availableArtists}
        pagination={pagination}
      />
    </article>
  )
}
