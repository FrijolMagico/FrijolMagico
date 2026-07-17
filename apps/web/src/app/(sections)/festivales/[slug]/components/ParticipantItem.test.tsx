import '../../../../../../test-setup'

import { afterEach, describe, expect, mock, test } from 'bun:test'
import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'

import { ParticipantItem } from './ParticipantItem'

afterEach(cleanup)

mock.module('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: { href: string; children: ReactNode } & Record<string, unknown>) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

describe('ParticipantItem', () => {
  test('prioritizes Instagram over other rrss when no catalog link in active mode', () => {
    const { container } = render(
      <ParticipantItem
        pseudonimo='Artista C'
        catalogoSlug={null}
        rrss={JSON.stringify({
          instagram: 'https://instagram.com/artistac',
          facebook: 'https://facebook.com/artistac'
        })}
        animationMode='active'
        categoryId='ilustracion'
        itemIndex={0}
      />
    )

    const link = container.querySelector<HTMLElement>('[data-spoiler-link]')
    expect(link?.getAttribute('href')).toBe('https://instagram.com/artistac')
    expect(link?.getAttribute('target')).toBe('_blank')
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(link?.getAttribute('aria-disabled')).toBe('true')
    expect(link?.getAttribute('tabindex')).toBe('-1')

    const content = container.querySelector<HTMLElement>(
      '[data-spoiler-content]'
    )
    expect(content?.querySelector('[data-spoiler-text]')).not.toBeNull()
  })

  test('uses first rrss when Instagram is not available', () => {
    const { container } = render(
      <ParticipantItem
        pseudonimo='Artista D'
        catalogoSlug={null}
        rrss={JSON.stringify({ facebook: 'https://facebook.com/artistad' })}
        animationMode='active'
        categoryId='ilustracion'
        itemIndex={1}
      />
    )

    const link = container.querySelector<HTMLElement>('[data-spoiler-link]')
    expect(link?.getAttribute('href')).toBe('https://facebook.com/artistad')
  })

  test('uses button for active participant without catalog or rrss', () => {
    const { container } = render(
      <ParticipantItem
        pseudonimo='Colectivo Y'
        catalogoSlug={null}
        rrss={null}
        animationMode='active'
        categoryId='arte'
        itemIndex={2}
      />
    )

    expect(container.querySelector('[data-spoiler-link]')).toBeNull()
    expect(container.querySelector('button[type="button"]')).not.toBeNull()
  })

  test('keeps rrss participant as span in inactive mode', () => {
    const { container } = render(
      <ParticipantItem
        pseudonimo='Artista E'
        catalogoSlug={null}
        rrss={JSON.stringify({ instagram: 'https://instagram.com/artistae' })}
      />
    )

    expect(container.querySelector('a')).toBeNull()
    expect(container.querySelector('span')?.textContent).toContain('Artista E')
  })

  test('shows ExternalLink icon for rrss participant', () => {
    const { container } = render(
      <ParticipantItem
        pseudonimo='Artista F'
        catalogoSlug={null}
        rrss={JSON.stringify({ instagram: 'https://instagram.com/artistaf' })}
        animationMode='active'
        categoryId='ilustracion'
        itemIndex={3}
      />
    )

    expect(container.querySelector('[data-spoiler-icon]')).not.toBeNull()
  })

  test('handles rrss with array values extracting first URL', () => {
    const { container } = render(
      <ParticipantItem
        pseudonimo='Artista G'
        catalogoSlug={null}
        rrss={JSON.stringify({ instagram: ['https://instagram.com/artistag'] })}
        animationMode='active'
        categoryId='ilustracion'
        itemIndex={4}
      />
    )

    const link = container.querySelector<HTMLElement>('[data-spoiler-link]')
    expect(link?.getAttribute('href')).toBe('https://instagram.com/artistag')
  })

  test('handles rrss with non-instagram platform and array value', () => {
    const { container } = render(
      <ParticipantItem
        pseudonimo='Artista H'
        catalogoSlug={null}
        rrss={JSON.stringify({ facebook: ['https://facebook.com/artistah'] })}
        animationMode='active'
        categoryId='ilustracion'
        itemIndex={5}
      />
    )

    const link = container.querySelector<HTMLElement>('[data-spoiler-link]')
    expect(link?.getAttribute('href')).toBe('https://facebook.com/artistah')
  })
  test('keeps inactive catalog participants as ordinary links', () => {
    render(
      <ParticipantItem
        pseudonimo='Artista Ejemplo'
        catalogoSlug='artista-ejemplo'
      />
    )
    expect(
      screen.getByRole('link', { name: 'Artista Ejemplo' }).getAttribute('href')
    ).toBe('/catalogo/artista-ejemplo')
    expect(document.querySelector('[data-spoiler-redaction]')).toBeNull()
  })

  test('covers the complete active visual item and link icon with one text-free redaction bar', () => {
    const { container } = render(
      <ParticipantItem
        pseudonimo='Artista Ejemplo'
        catalogoSlug='artista-ejemplo'
        animationMode='active'
        categoryId='ilustracion'
        itemIndex={1}
      />
    )
    const content = container.querySelector<HTMLElement>(
      '[data-spoiler-content]'
    )
    const overlay = content?.querySelector<HTMLElement>(
      '[data-spoiler-redaction]'
    )

    expect(content?.classList.contains('relative')).toBe(true)
    expect(content?.querySelector('[data-spoiler-text]')).not.toBeNull()
    expect(content?.querySelector('[data-spoiler-icon]')).not.toBeNull()
    expect(overlay?.parentElement).toBe(content)
    expect(overlay?.getAttribute('aria-hidden')).toBe('true')
    expect(overlay?.textContent).toBe('')
    expect(overlay?.classList.contains('absolute')).toBe(true)
    expect(overlay?.classList.contains('inset-0')).toBe(true)
    expect(overlay?.classList.contains('bg-palette-primary')).toBe(true)
    expect(overlay?.classList.contains('origin-left')).toBe(true)
    expect(overlay?.classList.contains('rounded')).toBe(true)
    expect(container.querySelectorAll('[data-spoiler-redaction]')).toHaveLength(
      1
    )
  })

  test('uses a button for an active participant without a catalog link', () => {
    render(
      <ParticipantItem
        pseudonimo='Colectivo X'
        catalogoSlug={null}
        animationMode='active'
        categoryId='arte'
        itemIndex={0}
      />
    )
    expect(screen.getByRole('button', { name: 'Colectivo X' })).toBeDefined()
  })

  test('puts an active catalog link behind a keyboard-reveal wrapper and disables its pointer input initially', () => {
    render(
      <ParticipantItem
        pseudonimo='Artista Ejemplo'
        catalogoSlug='artista-ejemplo'
        animationMode='active'
        categoryId='ilustracion'
        itemIndex={1}
      />
    )

    const item = screen.getByRole('button', { name: 'Artista Ejemplo' })
    const link = screen.getByRole('link', { name: 'Artista Ejemplo' })
    expect(item.getAttribute('data-spoiler-item')).toBe('')
    expect(link.getAttribute('data-spoiler-link')).toBe('true')
    expect(link.classList.contains('pointer-events-none')).toBe(true)
    expect(link.getAttribute('tabindex')).toBe('-1')
    expect(link.getAttribute('aria-disabled')).toBe('true')
  })
})
