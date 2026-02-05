import { getSession } from '@/app/(auth)/lib/get-session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const session = await getSession()

  return (
    <article className='space-y-6'>
      <header>
        <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
        <p className='text-gray-600'>
          Bienvenido, {session?.user.name.split(' ')[0]}. Gestiona el contenido
          de Frijol Mágico desde aquí.
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
              <span className='font-medium'>{session?.user.name}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Email:</span>
              <span className='font-medium'>{session?.user.email}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Sesión expira:</span>
              <span className='font-medium'>
                {session?.session.expiresAt
                  ? new Date(session.session.expiresAt).toLocaleString('es-CL')
                  : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  )
}
