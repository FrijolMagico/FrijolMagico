import { Suspense } from 'react'

import Image from 'next/image'
import { redirect } from 'next/navigation'

import { getSession } from '@/lib/auth/utils'
import { Skeleton } from '@/shared/components/ui/skeleton'

export async function PanelSidebarUserInfo() {
  return (
    <Suspense fallback={<UserInfoLoading />}>
      <UserInfo />
    </Suspense>
  )
}

async function UserInfo() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const user = session.user

  return (
    <div className='flex items-center gap-3'>
      <div className='bg-muted flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full'>
        {!user?.image ? (
          <span className='text-muted-foreground text-xs font-medium'>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </span>
        ) : (
          <Image
            src={user.image}
            width={32}
            height={32}
            alt={`Imágen de ${user.name}`}
          />
        )}
      </div>

      <div className='min-w-0 flex-1'>
        <p className='text-foreground truncate text-sm font-medium'>
          {user?.name}
        </p>
        <p className='text-muted-foreground truncate text-xs'>{user?.email}</p>
      </div>
    </div>
  )
}

function UserInfoLoading() {
  return (
    <>
      <Skeleton className='h-8 w-8 shrink-0 rounded-full' />
      <div className='flex-1 space-y-2'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-3 w-32' />
      </div>
    </>
  )
}
