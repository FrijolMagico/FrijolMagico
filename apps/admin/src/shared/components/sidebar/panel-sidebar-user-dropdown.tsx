'use client'

import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '../ui/dropdown-menu'
import {
  PanelSidebarUser,
  PanelSidebarUserSkeleton
} from './panel-sidebar-user'
import { useSidebar } from '../ui/sidebar'
import { Suspense } from 'react'
import { IconLogout } from '@tabler/icons-react'
import { authClient } from '@/shared/lib/auth'

interface PanelSidebarUserDropdownProps {
  user: {
    name: string
    email: string
    image?: string | null
  }
}

export function PanelSidebarUserDropdown({
  user
}: PanelSidebarUserDropdownProps) {
  const { isMobile } = useSidebar()

  const handleLogout = async () => {
    await authClient.signOut()
  }

  return (
    <DropdownMenuContent
      align='end'
      alignOffset={4}
      side={isMobile ? 'bottom' : 'right'}
      className='min-w-56'
    >
      <DropdownMenuGroup>
        <DropdownMenuLabel>
          <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
            <Suspense fallback={<PanelSidebarUserSkeleton />}>
              <PanelSidebarUser user={user} />
            </Suspense>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          variant='destructive'
          className='cursor-pointer text-nowrap'
        >
          <IconLogout />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  )
}
