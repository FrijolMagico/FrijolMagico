import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSession } from '@/app/(auth)/lib/get-session'
import { getCatalogoArtistas } from './_lib/getCatalogoData'
import { CatalogoArtistasContainer } from './_components/CatalogoArtistasContainer'
import { Skeleton } from '@/components/ui/skeleton'
import type { CatalogoFilters } from './_types/catalogo'

interface PageProps {
  searchParams: Promise<{
    page?: string
    activo?: string
    destacado?: string
    search?: string
  }>
}

function CatalogoLoading() {
  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-4 w-96' />
      </div>
      <div className='flex gap-4'>
        <Skeleton className='h-10 w-full max-w-sm' />
        <Skeleton className='h-10 w-[140px]' />
        <Skeleton className='h-10 w-[160px]' />
      </div>
      <Skeleton className='h-96 w-full' />
    </div>
  )
}

export default async function CatalogoArtistasPage({ searchParams }: PageProps) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // Parse search params
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))

  // Build filters
  const filters: CatalogoFilters = {
    activo:
      params.activo === undefined
        ? null
        : params.activo === 'true',
    destacado:
      params.destacado === undefined
        ? null
        : params.destacado === 'true',
    search: params.search ?? ''
  }

  // Fetch data
  const data = await getCatalogoArtistas(page, filters)

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Catálogo de Artistas</h1>
        <p className='text-gray-600'>
          Gestiona los artistas que aparecen en el catálogo público. Arrastra las filas para reordenar.
        </p>
      </div>

      <Suspense fallback={<CatalogoLoading />}>
        <CatalogoArtistasContainer initialData={data} />
      </Suspense>
    </div>
  )
}
