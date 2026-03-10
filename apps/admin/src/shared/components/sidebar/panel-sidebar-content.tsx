'use client'

import { navigation } from '@/lib/navigation'
import { PanelSidebarMenu } from './panel-sidebar-menu'

export function PanelSidebarContent() {
  return (
    <>
      <PanelSidebarMenu items={navigation.general} />
      <PanelSidebarMenu label='Artistas' items={navigation.artistas} />
      <PanelSidebarMenu label='Eventos' items={navigation.eventos} />
    </>
  )
}
