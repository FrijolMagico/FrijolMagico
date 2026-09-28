import { describe, expect, test } from 'bun:test'
import { render, screen } from '@testing-library/react'

import { ActivityArtistLink } from './ActivityArtistLink'

const renderArtist = (props: Partial<React.ComponentProps<typeof ActivityArtistLink>> = {}) =>
  render(
    <ActivityArtistLink
      pseudonym='Artista'
      rrss={null}
      email={null}
      {...props}
    />
  )

describe('ActivityArtistLink', () => {
  test('prefers the catalog profile and wraps it with the avatar follower', () => {
    const { container } = renderArtist({
      catalogSlug: 'artista-slug',
      avatarUrl: 'https://example.org/avatar.jpg',
      rrss: '{"instagram":"https://instagram.com/artista"}',
      email: 'artista@example.org'
    })
    const link = screen.getByRole('link', { name: 'Ver perfil de Artista' })

    expect(link.getAttribute('href')).toBe('/catalogo/artista-slug')
    expect(container.querySelector('img')).toBeNull()
    expect(link.parentElement?.className).toContain('inline-flex')
    expect(link.className).toContain('group')

    const icon = screen.getByTestId('activity-artist-catalog-icon')
    expect(icon.getAttribute('aria-hidden')).toBe('true')
    expect(icon.getAttribute('class')).toContain('group-hover:-rotate-45')
    expect(screen.queryByTestId('activity-artist-social-icon')).toBeNull()
    expect(screen.queryByTestId('activity-artist-email-icon')).toBeNull()
  })

  test('links to the first valid Instagram URL, then another valid social URL in object order', () => {
    const instagram = renderArtist({
      rrss: '{"instagram":"https://instagram.com/artista","web":"https://example.org"}'
    })
    const instagramLink = screen.getByRole('link', {
      name: 'Abrir enlace de contacto de Artista'
    })
    expect(instagramLink.getAttribute('href')).toBe('https://instagram.com/artista')
    expect(screen.getByTestId('activity-artist-social-icon').getAttribute('aria-hidden')).toBe('true')
    expect(screen.queryByTestId('activity-artist-email-icon')).toBeNull()
    instagram.unmount()

    renderArtist({
      rrss: '{"instagram":"javascript:alert(1)","first":"javascript:alert(2)","next":"https://example.org/artist"}'
    })
    const link = screen.getByRole('link', { name: 'Abrir enlace de contacto de Artista' })
    expect(link.getAttribute('href')).toBe('https://example.org/artist')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    expect(screen.getByTestId('activity-artist-social-icon').getAttribute('aria-hidden')).toBe('true')
  })

  test('falls back to valid email and leaves the pseudonym unlinked otherwise', () => {
    const { unmount } = renderArtist({ rrss: 'malformed', email: 'artista@example.org' })
    expect(screen.getByRole('link', { name: 'Abrir enlace de contacto de Artista' }).getAttribute('href')).toBe(
      'mailto:artista@example.org'
    )
    expect(screen.getByTestId('activity-artist-email-icon').getAttribute('aria-hidden')).toBe('true')
    expect(screen.queryByTestId('activity-artist-social-icon')).toBeNull()
    unmount()

    renderArtist({ rrss: '{"instagram":"//unsafe.example"}', email: 'bad email' })
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText('Artista').tagName).toBe('SPAN')
    expect(screen.queryByTestId('activity-artist-catalog-icon')).toBeNull()
    expect(screen.queryByTestId('activity-artist-social-icon')).toBeNull()
    expect(screen.queryByTestId('activity-artist-email-icon')).toBeNull()
  })

  test('ignores unknown JSON shapes and unsafe or malformed URL values', () => {
    const invalid = [
      'null',
      '[]',
      '{broken',
      '{"instagram":{"url":"https://example.org"},"web":["javascript:alert(1)"]}',
      '{"instagram":"https://user:pass@example.org"}'
    ]

    for (const rrss of invalid) {
      const { unmount } = renderArtist({ rrss, email: null })
      expect(screen.queryByRole('link')).toBeNull()
      unmount()
    }
  })
})
