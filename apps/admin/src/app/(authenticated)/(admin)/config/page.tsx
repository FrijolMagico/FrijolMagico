import { Suspense } from 'react'
import { Skeleton } from '@/shared/components/ui/skeleton'

function ConfigLoading() {
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
export default function ConfigPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-foreground text-2xl font-bold'>Configuración</h1>
        <p className='text-muted-foreground'>
          Gestiona la configuración general del sistema, incluyendo parámetros
          globales.
        </p>
      </div>
      <Suspense fallback={<ConfigLoading />}>
        <div>Configsss</div>
      </Suspense>
    </div>
  )
}
