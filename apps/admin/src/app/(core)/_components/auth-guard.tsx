import { requireAuth } from '@/shared/lib/auth/utils'

export async function AuthGuard({ children }: { children: React.ReactNode }) {
  await requireAuth()
  return <>{children}</>
}
