import { Suspense } from 'react'
import { ArtistListContainer } from './_components/artist-list-container'
import { getHistoryData } from './_lib/get-history-data'
import { HistoryStoreInitialization } from './_components/history-store-initialization'

export default async function ArtistsListPage() {
  const historyData = await getHistoryData()

  return (
    <div className='space-y-6'>
      <HistoryStoreInitialization initialData={historyData} />
      <div>
        <h1 className='text-foreground text-2xl font-bold'>
          Lista de Artistas
        </h1>
        <p className='text-muted-foreground'>
          Listado completo de artistas registrados en el sistema. Desde aquí
          puedes gestionar la información básica de cada artista.
        </p>
      </div>
      <Suspense fallback={<div>Cargando...</div>}>
        <ArtistListContainer />
      </Suspense>
    </div>
  )
}
