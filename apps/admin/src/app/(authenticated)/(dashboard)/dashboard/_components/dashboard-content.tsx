import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/shared/components/ui/card'
import {
  DashboardSessionExpiration,
  DashboardUserEmail,
  DashboardUserName,
  DashboardWelcomeName
} from './dashboard-user-info'
import { Suspense } from 'react'
import { Skeleton } from '@/shared/components/ui/skeleton'

export function DashboardContent() {
  return (
    <>
      <header>
        <h1 className='text-foreground text-2xl font-bold'>Dashboard</h1>

        <p className='text-muted-foreground'>
          Bienvenido,{' '}
          <Suspense
            fallback={
              <span className='bg-muted inline-block h-4 w-20 animate-pulse rounded-xl' />
            }
          >
            <DashboardWelcomeName />
          </Suspense>
          . Gestiona el contenido de Frijol Mágico desde aquí.
        </p>
      </header>

      <section className='flex flex-wrap gap-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle>Información de Sesión</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Nombre:</span>
              <Suspense fallback={<Skeleton className='h-4 w-42' />}>
                <DashboardUserName />
              </Suspense>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Email:</span>
              <Suspense fallback={<Skeleton className='h-4 w-38' />}>
                <DashboardUserEmail />
              </Suspense>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Sesión expira:</span>
              <Suspense fallback={<Skeleton className='h-4 w-48' />}>
                <DashboardSessionExpiration />
              </Suspense>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  )
}
