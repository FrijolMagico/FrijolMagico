import { Suspense } from 'react'
import { ArtistListContainer } from './_components/artist-list-container'
import { getHistoryData } from './_lib/get-artist-history'
import { getArtists } from './_lib/get-artists'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { EmptyState } from '@/shared/components/empty-state'
import { agrupateHistory } from './_lib/aggregate-history'

export default async function ArtistsListPage() {
  const [artists, history] = await Promise.all([getArtists(), getHistoryData()])
  const historyData = agrupateHistory(history)

  if (!artists) {
    return (
      <EmptyState
        title='No se encontraron artistas'
        description='No hay artistas registrados en el sistema. Puedes agregar nuevos artistas para que aparezcan en esta lista.'
      />
    )
  }

  const enrichedArtist = artists.map((artist) => ({
    ...artist,
    history: historyData[artist.id] || null
  }))

  return (
    <article className='h-full min-h-full space-y-6'>
      <header>
        <h1 className='text-foreground text-2xl font-bold'>
          Lista de Artistas
        </h1>
        <p className='text-muted-foreground'>
          Listado completo de artistas registrados en el sistema. Desde aquí
          puedes gestionar la información básica de cada artista.
        </p>
      </header>
      <Suspense fallback={<ArtistListSkeleton />}>
        <ArtistListContainer artists={enrichedArtist} />
      </Suspense>
    </article>
  )
}

function ArtistListSkeleton() {
  return (
    <div className='h-full w-full space-y-4'>
      <div className='flex h-fit w-full items-center gap-4'>
        <Skeleton className='h-9 w-80' />
        <div className='flex items-center gap-2'>
          <Skeleton className='h-9 w-40' />
          <Skeleton className='h-9 w-40' />
          <Skeleton className='h-9 w-40' />
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

      <Skeleton className='h-full w-full' />

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
