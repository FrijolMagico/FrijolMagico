import { Suspense } from 'react'

import { DropdownMenu, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar'
import { PanelSidebarUserDropdown } from './panel-sidebar-user-dropdown'
import {
  PanelSidebarUser,
  PanelSidebarUserSkeleton
} from './panel-sidebar-user'

import { getUser } from '@/lib/auth/utils'
import { redirect } from 'next/navigation'
import { authClient } from '@/lib/auth'
import { IconSelector } from '@tabler/icons-react'

export async function PanelSidebarFooter() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const handleLogout = async () => {
    'use server'
    await authClient.signOut()
  }

  return (
    <Suspense fallback={<PanelSidebarUserSkeleton />}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size='lg' className='cursor-pointer'>
                <PanelSidebarUser user={user} />
                <IconSelector />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <PanelSidebarUserDropdown user={user} handleLogout={handleLogout} />
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </Suspense>
  )
}
