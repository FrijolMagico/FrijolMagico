'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/ui/collapsible'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/shared/components/ui/sidebar'

import { ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { navigation } from '@/lib/navigation'

type NavigationItem = (typeof navigation)[number]
type CollapsibleNavigationItem = NavigationItem & {
  items: NonNullable<NavigationItem['items']>
}

type CollapsibleNavItemProps = {
  item: CollapsibleNavigationItem
  isActive: boolean
  pathname: string
}

const CollapsibleNavItem = ({
  item,
  isActive,
  pathname
}: CollapsibleNavItemProps) => {
  const [open, setOpen] = useState(isActive)

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className='group/collapsible'
    >
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={
            <SidebarMenuButton tooltip={item.title} isActive={isActive} />
          }
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          <ChevronRight className='ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90' />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  render={<Link href={subItem.href} />}
                  isActive={pathname === subItem.href}
                >
                  {subItem.title}
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export const PanelSidebarMenu = () => {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {navigation.map((item) => {
        const isActive = pathname.startsWith(item.href)

        if (item.items) {
          return (
            <CollapsibleNavItem
              key={item.title}
              item={item}
              isActive={isActive}
              pathname={pathname}
            />
          )
        }

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={pathname === item.href}
            >
              <Link href={item.href} className='flex w-full items-center gap-2'>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
