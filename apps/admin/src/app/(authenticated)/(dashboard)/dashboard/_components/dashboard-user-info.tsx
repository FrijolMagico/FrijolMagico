import { getUser, getSession } from '@/lib/auth/utils'

export async function DashboardWelcomeName() {
  const user = await getUser()
  return <strong>{user?.name.split(' ')[0]}</strong>
}

export async function DashboardUserName() {
  const user = await getUser()
  return <span className='font-medium'>{user?.name}</span>
}

export async function DashboardUserEmail() {
  const user = await getUser()
  return <span className='font-medium'>{user?.email}</span>
}

export async function DashboardSessionExpiration() {
  const session = await getSession()
  return (
    <span className='font-medium'>
      {session?.session.expiresAt
        ? new Date(session.session.expiresAt).toLocaleString('es-CL')
        : 'N/A'}
    </span>
  )
}
