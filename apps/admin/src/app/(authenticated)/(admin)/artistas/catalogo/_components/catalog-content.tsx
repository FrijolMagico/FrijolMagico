import { Suspense } from 'react'
import { EmptyState } from '@/shared/components/empty-state'
import { getCatalogData } from '../_lib/get-catalog-data'
import { CatalogStoreInitialization } from './catalog-store-initialization'
import { CatalogArtistsContainer } from './catalog-artists-container'
import { Skeleton } from '@/shared/components/ui/skeleton'

export async function CatalogContent() {
  const catalog = await getCatalogData()

  if (!catalog || catalog.length === 0) {
    return (
      <EmptyState
        title='No se encontraron artistas'
        description='No hay artistas que coincidan con los filtros aplicados.'
      />
    )
  }

  return (
    <Suspense fallback={<CatalogContentSkeleton />}>
      <CatalogStoreInitialization initialData={catalog} />
      <CatalogArtistsContainer />
    </Suspense>
  )
}

function CatalogContentSkeleton() {
  return (
    <div className='h-full w-full space-y-4'>
      <div className='flex h-fit w-full items-center gap-4'>
        <Skeleton className='h-9 w-60' />
        <div className='flex items-center gap-2'>
          <Skeleton className='h-9 w-36' />
          <Skeleton className='h-9 w-38' />
        </div>
      </div>

      <div className='flex h-fit w-full items-center justify-between gap-4 pt-8'>
        <Skeleton className='h-4 w-56' />
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-10' />

          <div className='flex items-center gap-1'>
            <Skeleton className='h-8 w-9' />
            <Skeleton className='h-8 w-9' />
            <Skeleton className='h-8 w-9' />
            <Skeleton className='h-8 w-9' />
          </div>
          <Skeleton className='h-8 w-10' />
        </div>
      </div>

      <Skeleton className='h-full w-full rounded-2xl' />

      <div className='flex h-fit w-full items-center justify-between gap-4 pt-8 pb-4'>
        <Skeleton className='h-4 w-56' />
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-10' />

          <div className='flex items-center gap-1'>
            <Skeleton className='h-8 w-9' />
            <Skeleton className='h-8 w-9' />
            <Skeleton className='h-8 w-9' />
            <Skeleton className='h-8 w-9' />
          </div>
          <Skeleton className='h-8 w-10' />
        </div>
      </div>
    </div>
  )
}
