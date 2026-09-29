import { afterEach, describe, expect, jest, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'

import { ActivityItem } from './ActivityItem'

import type { FestivalActivity } from '../../types/festival'

const registration = {
  start_at: '2026-09-05T16:30:00.000Z',
  end_at: '2026-09-05T17:30:00.000Z'
}
const baseActivity: FestivalActivity = {
  titulo: 'Taller',
  descripcion: null,
  ubicacion: null,
  ocurrencias: [
    {
      id: 1,
      fecha: '2026-09-05',
      hora_inicio: '14:00',
      duracion_minutos: 90,
      registration_url: 'https://example.org/one'
    }
  ],
  tipo: 'taller',
  participante_pseudonimo: 'Artista',
  catalogo_slug: 'artista',
  registration: { ...registration, url: 'https://example.org/legacy' }
}

afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

describe('ActivityItem', () => {
  test('shows the occurrence time and uses its URL for the eligible corner CTA', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    const longArtistName =
      'Artista con un nombre extraordinariamente extenso para esta tarjeta'
    const { container } = render(
      <ActivityItem
        activity={{ ...baseActivity, participante_pseudonimo: longArtistName }}
        isEditionPast={false}
      />
    )

    expect(screen.getByText('14:00hrs a 15:30hrs')).toBeDefined()
    const registrationLink = screen.getByRole('link', { name: 'Inscríbete' })
    expect(registrationLink.getAttribute('href')).toBe('https://example.org/one')
    const article = container.querySelector('article')!
    const ctaOffset = registrationLink.parentElement!
    const artistHeader = article.querySelector(':scope > div.min-w-0')!
    expect(ctaOffset.className).toContain('absolute')
    expect(ctaOffset.className).toContain('-top-5')
    expect(ctaOffset.className).toContain('-right-3')
    expect(ctaOffset.className).toContain('z-30')
    expect(registrationLink.className).toContain('pointer-events-auto')
    expect(registrationLink.querySelector('[aria-hidden="true"]')?.className).toContain(
      'translate-1'
    )
    expect(artistHeader.className).toContain('pr-28')
    expect(screen.getByRole('link', { name: `Ver perfil de ${longArtistName}` }).className).toContain(
      'break-words'
    )
    expect(article.textContent).not.toContain('Inscripciones abiertas hasta el')
    expect(container.textContent).not.toContain('Inscripciones abiertas hasta el')
    expect(container.textContent).not.toContain('2026-09-05')
  })

  test('keeps title and time in the disclosure summary and reveals location and description', () => {
    const { container } = render(
      <ActivityItem
        activity={{ ...baseActivity, descripcion: 'Aprende técnicas', ubicacion: 'Sala A' }}
        isEditionPast={false}
      />
    )
    const details = container.querySelector('details')!
    const summary = details.querySelector('summary')!

    expect(summary.textContent).toContain('Taller')
    expect(summary.textContent).toContain('14:00hrs a 15:30hrs')
    expect(summary.textContent).toContain('Sala A')
    const summaryTitle = summary.querySelector('h3')!
    const summarySchedule = summaryTitle.parentElement!.nextElementSibling!
    expect(summarySchedule.textContent).toBe('14:00hrs a 15:30hrsSala A')
    expect(summarySchedule.className).toContain('mt-2')
    expect(summarySchedule.className).toContain('space-y-0.5')
    expect(summarySchedule.className).toContain('leading-tight')
    expect(summarySchedule.children[0].className).toContain('text-palette-foreground/70')
    expect(summarySchedule.children[1].className).toContain('text-palette-foreground/60')
    expect(summary.querySelector('a')).toBeNull()
    expect(summary.className).toContain('before:absolute')
    expect(summary.className).toContain('before:inset-0')
    expect(summary.className).toContain('before:z-10')
    expect(container.querySelector('article')?.className).toContain('relative')
    expect(container.textContent).not.toContain('Detalles')
    expect(details.open).toBe(false)
    const disclosureContent = details.querySelector('[data-disclosure-content]')!
    expect(disclosureContent.className).toContain('z-20')
    expect(disclosureContent.className).toContain('pointer-events-none')
    expect(disclosureContent.className).toContain('[&>*]:pointer-events-auto')
    expect(disclosureContent.textContent).not.toContain('Sala A')
    expect(disclosureContent.querySelector('svg')).toBeNull()
    expect(details.textContent).toContain('Aprende técnicas')
  })

  test('shows location in the fallback without opening an empty description disclosure', () => {
    const emptyDescriptions = [null, '', '  \n ', '<p></p>', '<p><br></p>', '<p>&nbsp;</p>']

    for (const descripcion of emptyDescriptions) {
      const { container, unmount } = render(
        <ActivityItem
          activity={{ ...baseActivity, descripcion, ubicacion: 'Patio central' }}
        />
      )
      const article = container.querySelector('article')!

      expect(article.querySelector('details')).toBeNull()
      expect(Array.from(article.querySelectorAll('p')).map((item) => item.textContent)).toEqual([
        '14:00hrs a 15:30hrs',
        'Patio central'
      ])
      const fallbackTitle = article.querySelector('h3')!
      const fallbackSchedule = fallbackTitle.parentElement!.nextElementSibling!
      expect(fallbackSchedule.className).toContain('mt-2')
      expect(fallbackSchedule.className).toContain('space-y-0.5')
      expect(fallbackSchedule.className).toContain('leading-tight')
      expect(fallbackSchedule.children[0].className).toContain('text-palette-foreground/70')
      expect(fallbackSchedule.children[1].className).toContain('text-palette-foreground/60')
      expect(article.textContent?.match(/Patio central/g)).toHaveLength(1)
      expect(article.querySelector('p:last-child svg')).toBeNull()
      expect(article.querySelector('p:last-child')?.className).toContain(
        'text-palette-foreground/60'
      )
      unmount()
    }
  })

  test('shows a free presenter as plain text beneath the speaker without contact fallback', () => {
    const { container } = render(
      <ActivityItem
        activity={{
          ...baseActivity,
          tipo: 'charla',
          rrss: '{"instagram":"https://instagram.com/speaker"}',
          correo: 'speaker@example.org',
          presenter_nombre: 'Invitada sin perfil',
          presenter_catalogo_slug: null
        }}
      />
    )
    const presenter = screen.getByText('Invitada sin perfil')
    const speaker = screen.getByRole('link', { name: 'Ver perfil de Artista' })

    expect(presenter.tagName).toBe('SPAN')
    expect(presenter.closest('p')?.textContent).toBe('Presenta: Invitada sin perfil')
    expect(presenter.closest('p')?.previousElementSibling).toBe(speaker)
    expect(screen.queryByRole('link', { name: 'Abrir enlace de contacto de Invitada sin perfil' })).toBeNull()
    expect(container.textContent).not.toContain('speaker@example.org')
  })

  test('links a catalog presenter by the selected pseudonym and hides absent or non-talk presenters', () => {
    const linked = render(
      <ActivityItem
        activity={{
          ...baseActivity,
          tipo: 'charla',
          presenter_nombre: 'Sol Alterna',
          presenter_catalogo_slug: 'sol-artista'
        }}
      />
    )
    const presenterLink = screen.getByRole('link', { name: 'Ver perfil de Sol Alterna' })
    expect(presenterLink.getAttribute('href')).toBe('/catalogo/sol-artista')
    expect(presenterLink.closest('p')?.textContent).toBe('Presenta: Sol Alterna')
    linked.unmount()

    const absent = render(
      <ActivityItem activity={{ ...baseActivity, tipo: 'charla', presenter_nombre: null }} />
    )
    expect(screen.queryByText(/Presenta:/)).toBeNull()
    absent.unmount()

    render(
      <ActivityItem
        activity={{ ...baseActivity, tipo: 'taller', presenter_nombre: 'No corresponde' }}
      />
    )
    expect(screen.queryByText('No corresponde')).toBeNull()
  })

  test('renders a readable type badge and lets the card fill its proportional grid column', () => {
    const { container } = render(
      <ActivityItem activity={{ ...baseActivity, tipo: 'musica' }} badge='Música' />
    )
    const badge = screen.getByText('Música')
    const article = container.querySelector('article')!

    expect(badge.tagName).toBe('SPAN')
    expect(badge.className).toContain('rounded-full')
    expect(badge.className).toContain('absolute')
    expect(badge.className).toContain('-top-2')
    expect(badge.className).toContain('-left-2')
    expect(badge.className).toContain('bg-palette-accent/15')
    expect(badge.className).toContain('text-palette-foreground')
    expect(badge.className).toContain('border-palette-accent/40')
    expect(badge.parentElement).toBe(article)
    expect(article.querySelector('h3')?.textContent).toBe('Taller')
    expect(article.querySelector(':scope > div.min-w-0')?.className).toContain('pt-6')
    expect(article.className).toContain('w-full')
    expect(article.className).not.toContain('max-w-')
  })

  test('places the type badge above the title for expandable and static cards', () => {
    for (const descripcion of [null, 'Descripción']) {
      const { container, unmount } = render(
        <ActivityItem
          activity={{ ...baseActivity, descripcion, tipo: 'charla' }}
          badge='Charla'
        />
      )
      const article = container.querySelector('article')!
      const badge = article.querySelector(':scope > span.rounded-full')!
      const title = article.querySelector('h3')!

      expect(badge.textContent).toBe('Charla')
      expect(badge.className).toContain('bg-palette-secondary/15')
      expect(badge.className).toContain('border-palette-secondary/40')
      expect(badge.className).toContain('text-palette-foreground')
      expect(badge.parentElement).toBe(article)
      expect(badge.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(article.querySelector(':scope > div.min-w-0')?.className).toContain('pt-6')
      unmount()
    }
  })

  test('keeps the artist link independent of the native disclosure control', () => {
    const { container } = render(
      <ActivityItem
        activity={{ ...baseActivity, descripcion: 'Descripción', ubicacion: 'Sala A' }}
      />
    )
    const details = container.querySelector('details')!
    const summary = details.querySelector('summary')!
    const artistLink = screen.getByRole('link', { name: 'Ver perfil de Artista' })

    expect(artistLink.getAttribute('href')).toBe('/catalogo/artista')
    expect(artistLink.closest('summary')).toBeNull()
    expect(details.open).toBe(false)
    expect(summary.tagName).toBe('SUMMARY')
    expect(summary.hasAttribute('tabindex')).toBe(false)
    expect(artistLink.closest('summary')).toBeNull()
    expect(artistLink.parentElement?.className).toContain('relative')
    expect(artistLink.parentElement?.className).toContain('z-20')
  })

  test('keeps the registration link independent from card-surface toggling', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    const { container } = render(
      <ActivityItem
        activity={{ ...baseActivity, descripcion: 'Descripción', ubicacion: 'Sala A' }}
      />
    )
    const details = container.querySelector('details')!
    const registrationLink = screen.getByRole('link', { name: 'Inscríbete' })

    expect(details.open).toBe(false)
    expect(registrationLink.closest('summary')).toBeNull()
    expect(registrationLink.parentElement?.className).toContain('z-30')
  })

  test('hides the CTA without an occurrence URL or outside the registration window', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-05T16:30:00.000Z'))
    const untimed = {
      ...baseActivity,
      ocurrencias: [
        {
          id: 3,
          fecha: '2026-09-05',
          hora_inicio: null,
          duracion_minutos: null,
          registration_url: null
        }
      ]
    }
    const { unmount } = render(<ActivityItem activity={untimed} />)
    expect(screen.queryByRole('link', { name: 'Inscríbete' })).toBeNull()
    unmount()

    jest.setSystemTime(new Date('2026-09-05T17:30:00.001Z'))
    render(<ActivityItem activity={baseActivity} />)
    expect(screen.queryByRole('link', { name: 'Inscríbete' })).toBeNull()
  })

  test('keeps registration CTAs hidden during server render', () => {
    expect(
      renderToString(<ActivityItem activity={baseActivity} isEditionPast={false} />)
    ).not.toContain('Inscríbete')
  })
})
