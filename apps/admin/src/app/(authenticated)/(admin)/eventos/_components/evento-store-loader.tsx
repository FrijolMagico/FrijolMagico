import { getEventos } from '../_lib/get-eventos-data'
import { EventoStoreInitialization } from './evento-store-initialization'

export async function EventoStoreLoader() {
  const data = await getEventos()
  if (!data) return null

  return <EventoStoreInitialization initialData={data} />
}
