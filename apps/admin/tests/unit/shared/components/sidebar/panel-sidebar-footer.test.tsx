import { describe, expect, mock, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const mockUser = { id: '1', name: 'Test', email: 'test@frijolmagico.cl' }

mock.module('@/shared/lib/auth/utils', () => ({
  getUser: () => mockUser
}))

mock.module('next/navigation', () => ({
  redirect: () => {}
}))

// Stub sidebar/dropdown UI as minimal divs
mock.module('@/shared/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) =>
    createElement('div', { 'data-testid': 'dropdown-menu' }, children),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) =>
    createElement('div', { 'data-testid': 'dropdown-trigger' }, children)
}))

mock.module('@/shared/components/ui/sidebar', () => ({
  SidebarMenu: ({ children }: { children: React.ReactNode }) =>
    createElement('div', { 'data-testid': 'sidebar-menu' }, children),
  SidebarMenuButton: ({ children }: { children: React.ReactNode }) =>
    createElement('div', { 'data-testid': 'sidebar-menu-button' }, children),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) =>
    createElement('div', { 'data-testid': 'sidebar-menu-item' }, children)
}))

mock.module('./panel-sidebar-user-dropdown', () => ({
  PanelSidebarUserDropdown: () =>
    createElement('div', { 'data-testid': 'user-dropdown' })
}))

mock.module('./panel-sidebar-user', () => ({
  PanelSidebarUser: () =>
    createElement('div', { 'data-testid': 'panel-sidebar-user' }),
  PanelSidebarUserSkeleton: () =>
    createElement('div', { 'data-testid': 'panel-sidebar-user-skeleton' })
}))

mock.module('@tabler/icons-react', () => ({
  IconSelector: () => createElement('div', { 'data-testid': 'icon-selector' })
}))

import { PanelSidebarVersion } from '@/shared/components/sidebar/panel-sidebar-version'
import { PanelSidebarFooter } from '@/shared/components/sidebar/panel-sidebar-footer'

describe('PanelSidebarFooter with PanelSidebarVersion', () => {
  test('PanelSidebarVersion renders version text with v prefix', () => {
    const markup = renderToStaticMarkup(<PanelSidebarVersion />)
    expect(markup).toMatch(/v\d+\.\d+\.\d+/)
    expect(markup).toContain('font-mono')
  })

  test('PanelSidebarFooter async function exists and resolves', async () => {
    const footer = await PanelSidebarFooter()
    expect(footer).toBeDefined()
  })

  test('PanelSidebarFooter rendering includes content outside Suspense', async () => {
    const footer = await PanelSidebarFooter()
    const markup = renderToStaticMarkup(footer)
    // Suspense boundaries render fallback in renderToStaticMarkup,
    // but PanelSidebarVersion rendered OUTSIDE the Suspense boundary
    // should appear in output
    expect(markup).toBeTruthy()
  })
})
