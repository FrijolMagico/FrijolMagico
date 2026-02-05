import { redirect } from 'next/navigation'
import { getSession } from '@/app/(auth)/lib/get-session'
import { getOrganizacionData } from './lib/getOrganizacionData'
import { OrganizacionForm } from './components/OrganizacionForm'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'

function OrganizacionLoading() {
  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-4 w-96' />
      </div>
      <Skeleton className='h-100 w-full' />
      <Skeleton className='h-75 w-full' />
    </div>
  )
}

export default async function OrganizacionPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const data = await getOrganizacionData()

  if (!data) {
    return (
      <div className='flex h-100 items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold text-gray-900'>
            No se encontró la organización
          </h2>
          <p className='mt-2 text-gray-600'>
            No se pudo cargar la información de la organización.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Organización</h1>
        <p className='text-gray-600'>
          Gestiona la información general y el equipo de Frijol Mágico.
        </p>
      </div>

      <Suspense fallback={<OrganizacionLoading />}>
        <OrganizacionForm initialData={data} />
      </Suspense>
    </div>
  )
}
