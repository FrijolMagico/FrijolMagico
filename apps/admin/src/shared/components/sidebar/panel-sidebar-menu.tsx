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
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { navigation } from '@/lib/navigation'
import { getSectionsWithChanges } from '@/shared/change-journal/change-journal'
import { useSectionDirtyStore } from '@/shared/lib/section-dirty-store'
import { ROUTE_ENTITY_MAP } from '@/shared/lib/database-entities'

type NavigationItem = (typeof navigation)[number]
type CollapsibleNavigationItem = NavigationItem & {
  items: NonNullable<NavigationItem['items']>
}

type CollapsibleNavItemProps = {
  item: CollapsibleNavigationItem
  isActive: boolean
  pathname: string
  pendingSections: Set<string>
}

function routeHasPending(href: string, pendingSections: Set<string>): boolean {
  const entities = ROUTE_ENTITY_MAP[href] ?? []
  return entities.some((e) => pendingSections.has(e))
}

const CollapsibleNavItem = ({
  item,
  isActive,
  pathname,
  pendingSections
}: CollapsibleNavItemProps) => {
  const [open, setOpen] = useState(isActive)

  // Show dot on parent if ANY sub-item has pending changes
  const anySubItemPending = item.items.some((subItem) =>
    routeHasPending(subItem.href, pendingSections)
  )

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
          {anySubItemPending && (
            <span className='ml-auto h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]' />
          )}
          <ChevronRight className='h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90' />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => {
              const subHasPending = routeHasPending(
                subItem.href,
                pendingSections
              )
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    render={<Link href={subItem.href} />}
                    isActive={pathname === subItem.href}
                  >
                    {subItem.title}
                    {subHasPending && (
                      <span className='ml-auto h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]' />
                    )}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export const PanelSidebarMenu = () => {
  const pathname = usePathname()

  // Live dirty state: synchronous subscription to the projection-driven read model
  const dirtyMap = useSectionDirtyStore((s) => s.dirtyMap)

  const pendingSections = new Set(
    Object.entries(dirtyMap)
      .filter(([, dirty]) => dirty)
      .map(([section]) => section)
  )

  // Cold-start hydration: seed dirty store for sections not yet projected this session
  useEffect(() => {
    getSectionsWithChanges().then((sections) => {
      const { dirtyMap: currentMap, setDirty } = useSectionDirtyStore.getState()
      for (const { section, count } of sections) {
        if (!(section in currentMap)) {
          setDirty(section, count > 0)
        }
      }
    })
  }, [])

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
              pendingSections={pendingSections}
            />
          )
        }

        const hasPending = routeHasPending(item.href, pendingSections)

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={pathname === item.href}
            >
              <Link href={item.href} className='flex w-full items-center gap-2'>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                {hasPending && (
                  <span className='ml-auto h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]' />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
