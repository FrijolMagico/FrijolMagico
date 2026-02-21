import Link from 'next/link'
import Image from 'next/image'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
} from '@/shared/components/ui/sidebar'
import { PanelSidebarMenu } from './panel-sidebar-menu'
import { PanelSidebarUserInfo } from './panel-sidebar-user-info'

export function PanelSidebar() {
  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='h-16'>
        <Link href='/dashboard' className='flex h-full items-center gap-2'>
          <Image
            src='/logotipo_mono.png'
            alt='Logo Frijol Mágico'
            width={32}
            height={34}
            className='h-auto w-7.5 shrink-0'
          />
          <span className='text-foreground truncate font-semibold'>
            Frijol Mágico
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className='px-2'>
        <PanelSidebarMenu />
      </SidebarContent>

      <SidebarFooter className='border-t px-2 py-4'>
        <PanelSidebarUserInfo />
      </SidebarFooter>
    </Sidebar>
  )
}
