import { describe, expect, mock, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactNode } from 'react'
import { ARTIST_STATUS } from '@/core/artistas/_constants'
import type { ArtistWithHistory } from '@/core/artistas/_types/artist'
import type { ArtistDetail } from '@/core/artistas/_types/artist-detail'

mock.module('@/shared/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: ReactNode; open: boolean }) =>
    open ? <div role='dialog'>{children}</div> : null,
  DialogContent: ({
    children,
    className
  }: {
    children: ReactNode
    className?: string
  }) => <div className={className}>{children}</div>,
  DialogHeader: ({
    children,
    className
  }: {
    children: ReactNode
    className?: string
  }) => <header className={className}>{children}</header>,
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: ReactNode }) => (
    <p>{children}</p>
  )
}))
const state: {
  isArtistDetailOpen: boolean
  selectedDetailArtist: ArtistWithHistory | null
  artistDetail: ArtistDetail | null
  isDetailLoading: boolean
  detailError: string | null
  closeArtistDetailDialog: () => void
} = {
  isArtistDetailOpen: false,
  selectedDetailArtist: null,
  artistDetail: null,
  isDetailLoading: false,
  detailError: null,
  closeArtistDetailDialog: () => {}
}
mock.module('@/core/artistas/_store/artist-dialog-store', () => ({
  useArtistDialog: (selector: (value: typeof state) => unknown) =>
    selector(state)
}))
const { ArtistDetailDialog } =
  await import('@/core/artistas/_components/artist-detail-dialog')

const artist: ArtistWithHistory = {
  id: 1,
  pseudonimo: 'Ana Luna',
  nombre: 'Ana',
  rut: '123',
  telefono: '555',
  correo: 'ana@example.com',
  ciudad: 'Santiago',
  pais: 'Chile',
  estadoId: ARTIST_STATUS.ACTIVE,
  rrss: { instagram: ['https://instagram.com/ana'] },
  deletedAt: null,
  history: {
    pseudonimos: [{ historyId: 2, value: 'Luna', field: 'pseudonimo' }],
    correos: [],
    ciudades: [],
    paises: [],
    rrss: {}
  }
}
const detail: ArtistDetail = {
  images: [
    { id: 1, type: 'avatar', url: '/avatar.jpg', order: 0 },
    { id: 2, type: 'galeria', url: '/gallery.jpg', order: 1 }
  ],
  activities: [
    {
      id: 4,
      participationId: 1,
      editionId: 2,
      editionName: 'Dos',
      editionNumber: '2',
      editionCreatedAt: '2020',
      editionDate: '2024-01-01',
      eventId: 1,
      eventName: 'Festival',
      status: 'confirmado',
      notes: null,
      participationNotes: null,
      type: 'taller',
      title: 'Taller de luz'
    }
  ],
  exhibitions: [
    {
      id: 5,
      participationId: 2,
      editionId: 3,
      editionName: 'Tres',
      editionNumber: '3',
      editionCreatedAt: '2020',
      editionDate: '2025-01-01',
      eventId: 1,
      eventName: 'Festival',
      status: 'confirmado',
      notes: null,
      participationNotes: null,
      discipline: 'pintura'
    }
  ],
  activityCount: 1,
  exhibitionCount: 1
}

function render() {
  return renderToStaticMarkup(<ArtistDetailDialog />)
}

describe('read-only artist CV dialog', () => {
  test('keeps the bordered header outside the only scrollable content region', () => {
    Object.assign(state, {
      isArtistDetailOpen: true,
      selectedDetailArtist: artist,
      artistDetail: detail,
      isDetailLoading: false,
      detailError: null
    })
    const html = render()
    expect(html).toMatch(
      /<div class="[^"]*max-h-\[90dvh\][^"]*grid-rows-\[auto_minmax\(0,1fr\)\][^"]*overflow-hidden[^"]*">\s*<header class="[^"]*border-b[^"]*"/
    )
    expect(html).toMatch(
      /<\/header>\s*<div class="[^"]*min-h-0[^"]*overflow-y-auto[^"]*">/
    )
    expect(html).not.toMatch(/<header[^>]*overflow-y-auto/)
  })
  test('renders profile, history, gallery and participation sections without editing controls', () => {
    Object.assign(state, {
      isArtistDetailOpen: true,
      selectedDetailArtist: artist,
      artistDetail: detail,
      isDetailLoading: false,
      detailError: null
    })
    const html = render()
    for (const text of [
      'Ana Luna',
      'ana@example.com',
      'Luna',
      'instagram.com/ana',
      'Taller de luz',
      'pintura'
    ])
      expect(html).toContain(text)
    expect(html).toContain('/avatar.jpg')
    expect(html).toContain('/gallery.jpg')
    expect(html.indexOf('Exposiciones')).toBeLessThan(
      html.indexOf('Actividades')
    )
    expect(html).not.toMatch(/Guardar|Editar|Eliminar|Agregar|<input|<form/)
  })

  test('labels pseudonym and status and shows the combined participation total', () => {
    Object.assign(state, {
      isArtistDetailOpen: true,
      selectedDetailArtist: artist,
      artistDetail: detail,
      isDetailLoading: false,
      detailError: null
    })
    expect(render()).toMatch(/<dt[^>]*>Pseudónimo<\/dt><dd[^>]*>Ana Luna<\/dd>/)
    expect(render()).toMatch(/<dt[^>]*>Estado<\/dt><dd[^>]*>Activo<\/dd>/)
    expect(render()).toContain('2 Participaciones')

    Object.assign(state, {
      selectedDetailArtist: { ...artist, estadoId: ARTIST_STATUS.INACTIVE }
    })
    expect(render()).toMatch(/<dt[^>]*>Estado<\/dt><dd[^>]*>Inactivo<\/dd>/)
    Object.assign(state, {
      artistDetail: {
        ...detail,
        activities: [],
        exhibitions: [],
        activityCount: 0,
        exhibitionCount: 0
      }
    })
    expect(render()).toContain('0 Participaciones')
  })

  test('keeps long profile and history values readable inside a narrow panel', () => {
    Object.assign(state, {
      isArtistDetailOpen: true,
      selectedDetailArtist: {
        ...artist,
        correo: 'very.long.address.without.breaks@example.com',
        rrss: { instagram: ['https://instagram.com/' + 'a'.repeat(100)] },
        history: {
          ...artist.history,
          correos: [
            {
              historyId: 3,
              value: 'another.long.address@example.com',
              field: 'correo'
            }
          ]
        }
      },
      artistDetail: detail,
      isDetailLoading: false,
      detailError: null
    })
    const html = render()
    expect(html).toContain('very.long.address.without.breaks@example.com')
    expect(html).toContain('another.long.address@example.com')
    expect(html).toContain('https://instagram.com/' + 'a'.repeat(100))
    expect(html).toMatch(/<dl[^>]*class="[^"]*min-w-0[^\"]*"/)
    expect(html).toMatch(/<dd[^>]*class="[^"]*\[overflow-wrap:anywhere\][^"]*"/)
    expect(html).toMatch(/<a[^>]*class="[^"]*\[overflow-wrap:anywhere\][^"]*"/)
    expect(html).not.toContain('sm:grid-cols-2')
    expect(html).not.toContain('md:grid-cols-[')
    expect(html).toContain('lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]')
    expect(html).toMatch(
      /<dd[^>]*class="[^"]*\[overflow-wrap:anywhere\][^"]*">very.long.address.without.breaks@example.com<\/dd>/
    )
  })

  test('shows portrait at full column width without cropping and social URLs without platform labels', () => {
    Object.assign(state, {
      isArtistDetailOpen: true,
      selectedDetailArtist: {
        ...artist,
        rrss: {
          instagram: ['https://instagram.com/ana', 'javascript:alert(1)']
        },
        history: {
          ...artist.history,
          rrss: {
            web: [
              { historyId: 4, value: 'https://example.com/past', field: 'rrss' }
            ]
          }
        }
      },
      artistDetail: detail,
      isDetailLoading: false,
      detailError: null
    })
    const html = render()
    const portrait = html.match(
      /<img[^>]*alt="Retrato de Ana Luna"[^>]*\/>/
    )?.[0]
    expect(portrait).toContain('w-full')
    expect(portrait).toContain('h-auto')
    expect(portrait).not.toContain('object-cover')
    expect(portrait).not.toContain('aspect-square')
    expect(html).toContain('>https://instagram.com/ana</a>')
    expect(html).toContain('>https://example.com/past</a>')
    expect(html).not.toContain('instagram:')
    expect(html).not.toContain('web:')
    expect(html).not.toContain('javascript:alert')
  })

  test('separates and independently sorts exhibitions and activities across events with stable ties', () => {
    Object.assign(state, {
      isArtistDetailOpen: true,
      selectedDetailArtist: artist,
      artistDetail: {
        ...detail,
        exhibitions: [
          {
            ...detail.exhibitions[0],
            id: 6,
            editionDate: '2024-01-01',
            discipline: 'unknown-slug',
            eventName: 'Older event'
          },
          {
            ...detail.exhibitions[0],
            id: 7,
            editionDate: '2026-09-09',
            discipline: 'fotografia',
            eventName: 'New event',
            notes: 'Nota exposición',
            participationNotes: 'Nota participante'
          },
          {
            ...detail.exhibitions[0],
            id: 5,
            editionDate: '2026-09-09',
            discipline: 'narrativa-grafica',
            eventName: 'Tie event'
          }
        ],
        activities: [
          {
            ...detail.activities[0],
            id: 3,
            editionDate: '2024-01-01',
            title: 'Old workshop',
            eventName: 'Old activity'
          },
          {
            ...detail.activities[0],
            id: 9,
            editionDate: '2026-09-09',
            title: 'New workshop',
            eventName: 'New activity'
          }
        ],
        activityCount: 2,
        exhibitionCount: 3
      },
      isDetailLoading: false,
      detailError: null
    })
    const html = render()
    expect(html).toContain('5 Participaciones')
    expect(html).toContain('3 Exposiciones')
    expect(html).toContain('2 Actividades')
    expect(html).toContain('Narrativa Gráfica')
    expect(html).toContain('Fotografía')
    expect(html).toContain('unknown-slug')
    expect(html).toContain('9 sep 2026')
    expect(html).toContain('dateTime="2026-09-09"')
    expect(html).toContain('Nota exposición')
    expect(html).toContain('Nota participante')
    expect(html).toContain('New event · Tres')
    expect(html).toContain('New activity · Dos')
    expect(html).toMatch(
      /New event · Tres[\s\S]*?Fotografía[\s\S]*?<time dateTime="2026-09-09">9 sep 2026<\/time>[\s\S]*?Notas: Nota exposición[\s\S]*?Notas de participación: Nota participante/
    )
    expect(html).toMatch(/grid-cols-1[^\"]*lg:grid-cols-2/)
    expect(html.indexOf('Exposiciones')).toBeLessThan(
      html.indexOf('Actividades')
    )
    expect(html.indexOf('Fotografía')).toBeLessThan(
      html.indexOf('Narrativa Gráfica')
    )
    expect(html.indexOf('Narrativa Gráfica')).toBeLessThan(
      html.indexOf('unknown-slug')
    )
    expect(html.indexOf('New workshop')).toBeLessThan(
      html.indexOf('Old workshop')
    )
    expect(html).not.toMatch(
      /Total:|Estado: confirmado|>Exposición<|>Actividad<|1 exposición|1 actividad/
    )
  })

  test('uses singular participation heading for one entry and preserves date-only day across time zones', () => {
    Object.assign(state, {
      isArtistDetailOpen: true,
      selectedDetailArtist: artist,
      artistDetail: {
        ...detail,
        exhibitions: [
          { ...detail.exhibitions[0], eventName: '', editionName: '' }
        ],
        activities: [
          {
            ...detail.activities[0],
            eventName: '',
            editionName: '',
            title: '',
            editionDate: '2026-09-09'
          }
        ],
        activityCount: 1,
        exhibitionCount: 1
      },
      isDetailLoading: false,
      detailError: null
    })
    expect(render()).toContain('2 Participaciones')
    expect(render()).toContain('1 Exposición')
    expect(render()).toContain('1 Actividad')
    expect(render()).toContain('Evento sin nombre · Edición 3')
    expect(render()).toContain('Evento sin nombre · Edición 2')
    expect(render()).toContain('>taller</p>')
    expect(render()).toContain('9 sep 2026')
  })

  test('shows loading, error and empty states with profile still visible', () => {
    Object.assign(state, {
      isArtistDetailOpen: true,
      selectedDetailArtist: artist,
      artistDetail: null,
      isDetailLoading: true,
      detailError: null
    })
    expect(render()).toMatch(/role="status"[^>]*>Cargando detalle/)
    Object.assign(state, {
      isDetailLoading: false,
      detailError: 'No se pudo cargar el detalle del artista.'
    })
    expect(render()).toMatch(/role="alert"[^>]*>No se pudo cargar/)
    Object.assign(state, {
      artistDetail: {
        images: [],
        activities: [],
        exhibitions: [],
        activityCount: 0,
        exhibitionCount: 0
      },
      detailError: null
    })
    expect(render()).toContain('Sin participaciones')
    expect(render()).toContain('Sin imágenes')
    expect(render()).toContain('Ana Luna')
  })

  test('groups gallery and timeline in distinct sections with accessible empty feedback', () => {
    Object.assign(state, {
      isArtistDetailOpen: true,
      selectedDetailArtist: artist,
      artistDetail: {
        ...detail,
        images: [],
        activities: [],
        exhibitions: [],
        activityCount: 0,
        exhibitionCount: 0
      },
      isDetailLoading: false,
      detailError: null
    })
    const html = render()
    expect(html).toMatch(
      /<section[^>]*aria-labelledby="artist-gallery-title"[^>]*><div data-slot="card"/
    )
    expect(html).toMatch(
      /<section[^>]*aria-labelledby="artist-participations-title"[^>]*><div data-slot="card"/
    )
    expect(html).toContain('data-slot="empty-title"')
    expect(html).toContain('Sin imágenes en la galería.')
    expect(html).toContain('Sin participaciones registradas.')
  })
})
