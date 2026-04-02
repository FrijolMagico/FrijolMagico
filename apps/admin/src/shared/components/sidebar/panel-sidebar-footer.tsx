import { Suspense } from 'react'

import { DropdownMenu, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar'
import { PanelSidebarUserDropdown } from './panel-sidebar-user-dropdown'
import {
  PanelSidebarUser,
  PanelSidebarUserSkeleton
} from './panel-sidebar-user'

import { getUser } from '@/shared/lib/auth/utils'
import { redirect } from 'next/navigation'
import { IconSelector } from '@tabler/icons-react'

export async function PanelSidebarFooter() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <Suspense fallback={<PanelSidebarUserSkeleton />}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton size='lg' className='cursor-pointer'>
                  <PanelSidebarUser user={user} />
                  <IconSelector />
                </SidebarMenuButton>
              }
            />

            <PanelSidebarUserDropdown user={user} />
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </Suspense>
  )
}
