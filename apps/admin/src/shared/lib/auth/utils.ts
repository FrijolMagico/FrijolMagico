import { auth } from '.'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getSession() {
  return await auth.api.getSession({
    headers: await headers()
  })
}

export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return session
}

export async function getUser() {
  const session = await getSession()
  return session?.user ?? null
}
