import { getEdiciones, getLugares } from '../_lib/get-ediciones-data'
import { getEventos } from '../../_lib/get-eventos-data'
import { EdicionContainer } from './edicion-container'

export async function EdicionContent() {
  const [result, lugares, eventos] = await Promise.all([
    getEdiciones(),
    getLugares(),
    getEventos()
  ])

  return (
    <EdicionContainer
      ediciones={result?.ediciones ?? []}
      dias={result?.dias ?? []}
      lugares={lugares ?? []}
      eventos={eventos ?? []}
    />
  )
}
