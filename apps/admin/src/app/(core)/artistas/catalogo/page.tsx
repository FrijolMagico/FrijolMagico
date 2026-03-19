import type { RawAdminListSearchParams } from '@/shared/lib/admin-list-params'
import { parseAdminListParams } from '@/shared/lib/admin-list-params'
import {
  CATALOG_LIST_FILTER_KEYS,
  type CatalogListQueryFilters
} from '@/shared/types/admin-list-filters'
import { getCatalogData, getArtistsNotInCatalog } from './_lib/get-catalog-data'
import { CatalogContainer } from './_components/catalog-container'

interface CatalogArtistsPageProps {
  searchParams: Promise<RawAdminListSearchParams>
}

export default async function CatalogArtistsPage({
  searchParams
}: CatalogArtistsPageProps) {
  const rawSearchParams = await searchParams
  const query = parseAdminListParams<CatalogListQueryFilters>(rawSearchParams, {
    allowedFilters: [
      CATALOG_LIST_FILTER_KEYS.ACTIVO,
      CATALOG_LIST_FILTER_KEYS.DESTACADO
    ]
  })

  const [catalog, availableArtists] = await Promise.all([
    getCatalogData(query),
    getArtistsNotInCatalog()
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
        catalog={catalog.data}
        availableArtists={availableArtists}
        pagination={catalog}
        query={query}
      />
    </article>
  )
}
