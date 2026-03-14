import { Suspense } from 'react'
import { getCatalogData } from '../_lib/get-catalog-data'
import { getArtists } from '../../_lib/get-artists'
import { CatalogContainer } from './catalog-container'
import { Skeleton } from '@/shared/components/ui/skeleton'

export async function CatalogContent() {
  const [catalog, artists] = await Promise.all([getCatalogData(), getArtists()])

  return (
    <Suspense fallback={<CatalogContentSkeleton />}>
      <CatalogContainer catalog={catalog ?? []} artists={artists ?? []} />
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
