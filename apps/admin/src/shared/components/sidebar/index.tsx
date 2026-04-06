import Image from 'next/image'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/shared/components/ui/sidebar'
import { PanelSidebarFooter } from './panel-sidebar-footer'
import { PanelSidebarContent } from './panel-sidebar-content'

export async function PanelSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Image
          src='/logotipo_asoc_2026_color.png'
          alt='Logo Frijol Mágico'
          width={400}
          height={228}
          className='h-16 w-fit shrink-0 px-2'
        />
      </SidebarHeader>

      <SidebarContent>
        <PanelSidebarContent />
      </SidebarContent>

      <SidebarFooter>
        <PanelSidebarFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
