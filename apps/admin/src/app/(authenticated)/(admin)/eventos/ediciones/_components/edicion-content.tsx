import { getEdiciones, getLugares } from '../_lib/get-ediciones-data'
import { EdicionStoreInitialization } from './edicion-store-initialization'
import { EdicionContainer } from './edicion-container'

export async function EdicionContent() {
  const [result, lugares] = await Promise.all([getEdiciones(), getLugares()])

  if (!result) {
    return <p>No hay ediciones.</p>
  }

  return (
    <>
      <EdicionStoreInitialization
        ediciones={result.ediciones}
        dias={result.dias}
        lugares={lugares ?? []}
      />
      <EdicionContainer />
    </>
  )
}
