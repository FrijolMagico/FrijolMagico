
import { Suspense } from 'react'
import { EdicionContent } from './_components/edicion-content'

export default function EdicionesPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-foreground text-2xl font-bold'>Ediciones</h1>
        <p className='text-muted-foreground'>
          Gestiona las ediciones de los eventos.
        </p>
      </div>
      <Suspense fallback={<div>Cargando...</div>}>
        <EdicionContent />
      </Suspense>
    </div>
  )
}
