import { Suspense } from 'react'
import { getCatalogArtists } from './_lib/get-catalog-data'
import { CatalogArtistsContainer } from './_components/catalog-artists-container'
import { Skeleton } from '@/shared/components/ui/skeleton'
import type { CatalogFilters } from './_types'

interface PageProps {
  searchParams: Promise<{
    page?: string
    activo?: string
    destacado?: string
    search?: string
  }>
}

function CatalogLoading() {
  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-4 w-96' />
      </div>
      <div className='flex gap-4'>
        <Skeleton className='h-10 w-full max-w-sm' />
        <Skeleton className='h-10 w-35' />
        <Skeleton className='h-10 w-40' />
      </div>
      <Skeleton className='h-96 w-full' />
    </div>
  )
}

async function CatalogContent({ filters }: { filters: CatalogFilters }) {
  const data = await getCatalogArtists(filters)
  return <CatalogArtistsContainer initialData={data} />
}

export default async function CatalogArtistsPage({ searchParams }: PageProps) {
  // Parse search params
  const params = await searchParams

  // Build filters
  const filters: CatalogFilters = {
    activo: params.activo === undefined ? null : params.activo === 'true',
    destacado:
      params.destacado === undefined ? null : params.destacado === 'true',
    search: params.search ?? ''
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-foreground text-2xl font-bold'>
          Catálogo de Artistas
        </h1>
        <p className='text-muted-foreground'>
          Gestiona los artistas que aparecen en el catálogo público. Arrastra
          las filas para reordenar.
        </p>
      </div>

      <Suspense fallback={<CatalogLoading />}>
        <CatalogContent filters={filters} />
      </Suspense>
    </div>
  )
}
