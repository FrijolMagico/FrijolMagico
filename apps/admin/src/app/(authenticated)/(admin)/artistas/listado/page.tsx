import { Suspense } from 'react'
import { Skeleton } from '@/shared/components/ui/skeleton'

function ArtistsLoading() {
  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-48' /> <Skeleton className='h-4 w-96' />
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
export default function ArtistsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-foreground text-2xl font-bold'>
          Lista de Artistas
        </h1>
        <p className='text-muted-foreground'>
          Listado completo de artistas registrados en el sistema. Desde aquí
          puedes gestionar la información básica de cada artista, como su
          nombre, disciplina y estado.
        </p>
      </div>
      <Suspense fallback={<ArtistsLoading />}>
        <div>Artistas List</div>
      </Suspense>
    </div>
  )
}
