import { Suspense } from 'react'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { CatalogContent } from './_components/catalog-content'

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

export default function CatalogArtistsPage() {
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
        <CatalogContent />
      </Suspense>
    </div>
  )
}
