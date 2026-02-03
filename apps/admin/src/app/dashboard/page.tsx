import { getSession } from '@/app/auth/lib/get-session'
import { LogoutButton } from '@/components/LogoutButton'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-6 rounded-lg bg-white p-6 shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Dashboard - Frijol Mágico Admin
              </h1>
              <p className='mt-1 text-gray-600'>
                Bienvenido al panel de administración
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>

        {session?.user && (
          <div className='rounded-lg bg-white p-6 shadow'>
            <h2 className='mb-4 text-lg font-semibold text-gray-900'>
              Información de Sesión
            </h2>
            <div className='space-y-2 text-sm'>
              <p>
                <span className='font-medium'>Nombre:</span> {session.user.name}
              </p>
              <p>
                <span className='font-medium'>Email:</span> {session.user.email}
              </p>
              <p>
                <span className='font-medium'>ID:</span> {session.user.id}
              </p>
              <p>
                <span className='font-medium'>Sesión expira:</span>{' '}
                {new Date(session.session.expiresAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
