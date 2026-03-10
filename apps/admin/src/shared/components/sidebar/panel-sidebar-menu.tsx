'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/ui/collapsible'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from '@/shared/components/ui/sidebar'

import Link from 'next/link'
import { IconChevronsRight, TablerIcon } from '@tabler/icons-react'

interface PanelSidebarMenuProps {
  label?: string
  items: {
    title: string
    url: string
    icon?: TablerIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}

export const PanelSidebarMenu = ({ items, label }: PanelSidebarMenuProps) => {
  const { setOpenMobile } = useSidebar()

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          if (item.items) {
            return (
              <Collapsible
                key={item.title}
                defaultOpen={item.isActive}
                className='group/collapsible'
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    <IconChevronsRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link
                              onClick={() => setOpenMobile(false)}
                              href={subItem.url}
                            >
                              {subItem.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title}>
                <Link
                  onClick={() => setOpenMobile(false)}
                  href={item.url}
                  className='flex w-full items-center gap-2'
                >
                  {item.icon && <item.icon />}
                  {item.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
