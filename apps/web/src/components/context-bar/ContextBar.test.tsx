import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import { parsePathname, getSections, type BreadcrumbSegment } from '@/utils/paths'
import { ContextBreadcrumb } from './ContextBreadcrumb'
import { ContextDropdown } from './ContextDropdown'

mock.module('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  )
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

    const items = screen.getAllByRole('link')
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

    const activeItem = screen.getByRole('link', { name: 'Festivales' })
    expect(activeItem.querySelector('svg')).not.toBeNull()

    const inactiveItem = screen.getByRole('link', { name: 'Catálogo' })
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
