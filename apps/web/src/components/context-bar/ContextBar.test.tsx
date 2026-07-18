import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { parsePathname, getSections, type BreadcrumbSegment } from '@/utils/paths'
import { ContextBar } from './ContextBar'
import { ContextBreadcrumb } from './ContextBreadcrumb'
import { ContextDropdown } from './ContextDropdown'

let pathname = '/'

mock.module('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
    children: ReactNode
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

mock.module('next/image', () => ({
  default: ({ alt }: { alt: string }) => createElement('img', { alt })
}))

mock.module('next/navigation', () => ({
  usePathname: () => pathname
}))

mock.module('@/hooks/useScrollHide', () => ({
  useScrollHide: () => true
}))

afterEach(cleanup)

// ── parsePathname ──

describe('parsePathname', () => {
  test('homepage returns an empty array', () => {
    expect(parsePathname('/')).toEqual([])
  })

  test('top-level catalog returns a single current segment', () => {
    expect(parsePathname('/catalogo')).toEqual([
      { label: 'Catálogo', href: '/catalogo', current: true }
    ])
  })

  test('nested catalog route returns parent and formatted child', () => {
    expect(parsePathname('/catalogo/canela')).toEqual([
      { label: 'Catálogo', href: '/catalogo', current: false },
      { label: 'Canela', href: '/catalogo/canela', current: true }
    ])
  })

  test('festival section returns label from paths', () => {
    expect(parsePathname('/festivales')).toEqual([
      { label: 'Festivales', href: '/festivales', current: true }
    ])
  })

  test('festival edition uses formatSlug fallback', () => {
    expect(parsePathname('/festivales/edicion-xv')).toEqual([
      { label: 'Festivales', href: '/festivales', current: false },
      { label: 'Edicion Xv', href: '/festivales/edicion-xv', current: true }
    ])
  })

  test('about section returns label from paths', () => {
    expect(parsePathname('/nosotros')).toEqual([
      { label: 'Nosotros', href: '/nosotros', current: true }
    ])
  })

  test('unknown route uses formatSlug fallback for every segment', () => {
    expect(parsePathname('/ruta-desconocida')).toEqual([
      { label: 'Ruta Desconocida', href: '/ruta-desconocida', current: true }
    ])
  })
})

// ── ContextBar ──

describe('ContextBar', () => {
  test.each([
    '/ruta-desconocida',
    '/catalogo/artista-inexistente',
    '/festivales/edicion-inexistente'
  ])('minimal mode omits path-derived controls for %s', (invalidPath) => {
    pathname = invalidPath
    const { container } = render(<ContextBar mode='minimal' />)

    expect(screen.getByRole('link', { name: 'Inicio' })).toBeDefined()
    expect(screen.getByRole('button', { name: /secciones/i })).toBeDefined()
    expect(screen.queryByRole('link', { name: 'Volver' })).toBeNull()
    expect(container.querySelector('[aria-current]')).toBeNull()
    expect(container.textContent).not.toContain('Ruta Desconocida')
    expect(container.textContent).not.toContain('Artista Inexistente')
    expect(container.textContent).not.toContain('Edicion Inexistente')
  })

  test('normal mode retains breadcrumbs for a valid dynamic route', () => {
    pathname = '/catalogo/canela'
    const { container } = render(<ContextBar />)

    expect(screen.getByRole('link', { name: 'Volver' })).toBeDefined()
    expect(screen.getByRole('link', { name: 'Catálogo' })).toBeDefined()
    expect(container.querySelector('[aria-current="page"]')?.textContent).toBe(
      'Canela'
    )
  })

  test('homepage retains its minimal presentation', () => {
    pathname = '/'
    const { container } = render(<ContextBar />)

    expect(screen.getByRole('link', { name: 'Inicio' })).toBeDefined()
    expect(screen.getByRole('button', { name: /secciones/i })).toBeDefined()
    expect(screen.queryByRole('link', { name: 'Volver' })).toBeNull()
    expect(container.querySelector('[aria-current]')).toBeNull()
  })
})

// ── ContextBreadcrumb ──

describe('ContextBreadcrumb', () => {
  test('renders parent links and marks the last segment as current', () => {
    const segments: BreadcrumbSegment[] = [
      { label: 'Festivales', href: '/festivales', current: false },
      { label: 'Edicion Xv', href: '/festivales/edicion-xv', current: true }
    ]

    const { container } = render(<ContextBreadcrumb segments={segments} />)

    const links = container.querySelectorAll('a')
    expect(links).toHaveLength(1)
    expect(links[0]?.getAttribute('href')).toBe('/festivales')

    const current = container.querySelector('[aria-current="page"]')
    expect(current).not.toBeNull()
    expect(current?.textContent).toBe('Edicion Xv')
  })

  test('hides parent segments on mobile', () => {
    const segments: BreadcrumbSegment[] = [
      { label: 'Catálogo', href: '/catalogo', current: false },
      { label: 'Canela', href: '/catalogo/canela', current: true }
    ]

    const { container } = render(<ContextBreadcrumb segments={segments} />)

    const listItems = container.querySelectorAll('li')
    expect(listItems[0]?.classList.contains('hidden')).toBe(true)
    expect(listItems[0]?.classList.contains('md:inline')).toBe(true)
  })
})

// ── ContextDropdown ──

describe('ContextDropdown', () => {
  const mockSections = getSections()

  test('toggles the menu open and closed', () => {
    render(
      <ContextDropdown sections={mockSections} activeSection='/catalogo' />
    )

    const button = screen.getByRole('button', { name: /secciones/i })
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(button.getAttribute('aria-haspopup')).toBe('true')

    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('menu')).toBeDefined()

    const items = screen.getAllByRole('menuitem')
    expect(items).toHaveLength(mockSections.length)

    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  test('marks the active section with a checkmark', () => {
    render(
      <ContextDropdown sections={mockSections} activeSection='/festivales' />
    )

    fireEvent.click(screen.getByRole('button', { name: /secciones/i }))

    const activeItem = screen.getByRole('menuitem', { name: 'Festivales' })
    expect(activeItem.querySelector('svg')).not.toBeNull()

    const inactiveItem = screen.getByRole('menuitem', { name: 'Catálogo' })
    expect(inactiveItem.querySelector('svg')).toBeNull()
  })

  test('closes the menu when Escape is pressed', () => {
    render(
      <ContextDropdown sections={mockSections} activeSection='/catalogo' />
    )

    fireEvent.click(screen.getByRole('button', { name: /secciones/i }))
    expect(screen.getByRole('menu')).toBeDefined()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
  })

  test('closes the menu when clicking outside', () => {
    render(
      <ContextDropdown sections={mockSections} activeSection='/catalogo' />
    )

    fireEvent.click(screen.getByRole('button', { name: /secciones/i }))
    expect(screen.getByRole('menu')).toBeDefined()

    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('menu')).toBeNull()
  })
})
