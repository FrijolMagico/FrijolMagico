import { Suspense } from 'react'

import { redirect } from 'next/navigation'

import { getSession } from '@/lib/auth/utils'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { LogoutButton } from '../logout-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

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
    <section>
      <div className='flex items-center gap-3'>
        <DropdownMenu>
          <Tooltip>
            <DropdownMenuTrigger
              render={
                <TooltipTrigger>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='cursor-pointer rounded-full'
                  >
                    <Avatar>
                      <AvatarImage
                        src={session.user.image ?? undefined}
                        alt={`Imagen de ${session.user.name}`}
                      />
                      <AvatarFallback>{session.user.name[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </TooltipTrigger>
              }
              className='bg-muted flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full'
            />

            <TooltipContent sideOffset={12}>Opciones</TooltipContent>
          </Tooltip>
          <DropdownMenuContent
            align='start'
            alignOffset={16}
            side='top'
            className='w-48'
          >
            <LogoutButton />
          </DropdownMenuContent>
        </DropdownMenu>

        <div className='min-w-0 flex-1'>
          <p className='text-foreground truncate text-sm font-medium'>
            {user?.name}
          </p>
          <p className='text-muted-foreground truncate text-xs'>
            {user?.email}
          </p>
        </div>
      </div>
    </section>
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
