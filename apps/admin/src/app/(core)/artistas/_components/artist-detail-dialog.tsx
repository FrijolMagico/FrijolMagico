'use client'

import Image from 'next/image'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

import { DISCIPLINE_LABELS } from '@/core/dashboard/_constants'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyTitle
} from '@/shared/components/ui/empty'
import { Item, ItemContent } from '@/shared/components/ui/item'
import { Separator } from '@/shared/components/ui/separator'

import { STATUS_LABEL_MAP } from '../_constants'
import { useArtistDialog } from '../_store/artist-dialog-store'
import type { ArtistWithHistory } from '../_types/artist'
import type {
  ArtistDetail,
  ArtistDetailActivity,
  ArtistDetailExhibition
} from '../_types/artist-detail'
import type { HistoryFieldEntry } from '../_lib/aggregate-history'

function safeLink(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.href
      : null
  } catch {
    return null
  }
}

function SocialLinks({ links }: { links: string[] }) {
  const validLinks = links.flatMap((url) => {
    const href = safeLink(url)
    return href ? [{ url, href }] : []
  })
  if (!validLinks.length) return '—'
  return (
    <ul className='flex min-w-0 flex-col gap-2'>
      {validLinks.map(({ url, href }, index) => (
        <li key={`${url}-${index}`} className='min-w-0'>
          <a
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary min-w-0 [overflow-wrap:anywhere] underline underline-offset-2'
          >
            {url}
          </a>
        </li>
      ))}
    </ul>
  )
}

function HistoryValues({
  label,
  entries
}: {
  label: string
  entries: HistoryFieldEntry[]
}) {
  if (!entries.length) return null
  return (
    <div className='min-w-0'>
      <dt className='text-muted-foreground text-sm'>{label}</dt>
      <dd className='min-w-0 [overflow-wrap:anywhere]'>
        {entries.map((entry) => entry.value).join(', ')}
      </dd>
    </div>
  )
}

function Profile({ artist }: { artist: ArtistWithHistory }) {
  const links = Object.values(artist.rrss ?? {}).flatMap((value) =>
    Array.isArray(value) ? value : [value]
  )
  const pastLinks = Object.values(artist.history?.rrss ?? {}).flatMap(
    (entries) => entries.map(({ value }) => value)
  )
  const history = artist.history
  const hasHistory =
    !!history &&
    [
      history.pseudonimos,
      history.correos,
      history.ciudades,
      history.paises,
      pastLinks
    ].some((entries) => entries.length)

  return (
    <section aria-labelledby='artist-profile-title' className='min-w-0'>
      <Card size='sm' className='min-w-0'>
        <CardHeader>
          <h3 id='artist-profile-title' className='text-base font-semibold'>
            Perfil
          </h3>
        </CardHeader>
        <CardContent className='min-w-0 space-y-5'>
          <dl className='grid min-w-0 grid-cols-1 gap-3'>
            <div className='min-w-0'>
              <dt className='text-muted-foreground text-sm'>Pseudónimo</dt>
              <dd className='min-w-0 [overflow-wrap:anywhere]'>
                {artist.pseudonimo || '—'}
              </dd>
            </div>
            <div className='min-w-0'>
              <dt className='text-muted-foreground text-sm'>Nombre</dt>
              <dd className='min-w-0 [overflow-wrap:anywhere]'>
                {artist.nombre || '—'}
              </dd>
            </div>
            <div className='min-w-0'>
              <dt className='text-muted-foreground text-sm'>Estado</dt>
              <dd>{STATUS_LABEL_MAP[artist.estadoId] ?? 'Desconocido'}</dd>
            </div>
            <div className='min-w-0'>
              <dt className='text-muted-foreground text-sm'>RUT</dt>
              <dd className='min-w-0 [overflow-wrap:anywhere]'>
                {artist.rut || '—'}
              </dd>
            </div>
            <div className='min-w-0'>
              <dt className='text-muted-foreground text-sm'>Correo</dt>
              <dd className='min-w-0 [overflow-wrap:anywhere]'>
                {artist.correo || '—'}
              </dd>
            </div>
            <div className='min-w-0'>
              <dt className='text-muted-foreground text-sm'>Teléfono</dt>
              <dd className='min-w-0 [overflow-wrap:anywhere]'>
                {artist.telefono || '—'}
              </dd>
            </div>
            <div className='min-w-0'>
              <dt className='text-muted-foreground text-sm'>Ubicación</dt>
              <dd className='min-w-0 [overflow-wrap:anywhere]'>
                {[artist.ciudad, artist.pais].filter(Boolean).join(', ') || '—'}
              </dd>
            </div>
            <div className='min-w-0'>
              <dt className='text-muted-foreground text-sm'>Redes sociales</dt>
              <dd className='min-w-0'>
                <SocialLinks links={links} />
              </dd>
            </div>
          </dl>
          <Separator />
          <div className='min-w-0 space-y-3'>
            <h4 className='font-semibold'>Historial</h4>
            {hasHistory ? (
              <dl className='grid min-w-0 grid-cols-1 gap-3'>
                <HistoryValues
                  label='Pseudónimos'
                  entries={history.pseudonimos}
                />
                <HistoryValues label='Correos' entries={history.correos} />
                <HistoryValues label='Ciudades' entries={history.ciudades} />
                <HistoryValues label='Países' entries={history.paises} />
                {pastLinks.length ? (
                  <div className='min-w-0'>
                    <dt className='text-muted-foreground text-sm'>
                      Redes sociales anteriores
                    </dt>
                    <dd className='min-w-0'>
                      <SocialLinks links={pastLinks} />
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <Empty className='bg-muted/30 p-4'>
                <EmptyDescription>Sin historial registrado.</EmptyDescription>
              </Empty>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

type ParticipationEntry = ArtistDetailActivity | ArtistDetailExhibition

function ParticipationList({
  items,
  kind
}: {
  items: ParticipationEntry[]
  kind: 'exhibition' | 'activity'
}) {
  const sorted = [...items].sort(
    (a, b) =>
      b.editionDate.localeCompare(a.editionDate) ||
      b.editionId - a.editionId ||
      b.id - a.id
  )
  return (
    <section
      className='min-w-0'
      aria-label={kind === 'exhibition' ? 'Exposiciones' : 'Actividades'}
    >
      <h4 className='mb-3 font-semibold'>
        {items.length}{' '}
        {kind === 'exhibition'
          ? items.length === 1
            ? 'Exposición'
            : 'Exposiciones'
          : items.length === 1
            ? 'Actividad'
            : 'Actividades'}
      </h4>
      {sorted.length ? (
        <ol className='space-y-3'>
          {sorted.map((item) => (
            <li key={item.id} className='min-w-0'>
              <Item variant='outline' className='min-w-0 items-start'>
                <ItemContent className='min-w-0 [overflow-wrap:anywhere]'>
                  <p className='font-medium'>
                    {item.eventName || 'Evento sin nombre'} ·{' '}
                    {item.editionName || `Edición ${item.editionNumber}`}
                  </p>
                  <p className='text-muted-foreground mt-1 text-sm'>
                    {'discipline' in item
                      ? (DISCIPLINE_LABELS[item.discipline] ?? item.discipline)
                      : item.title || item.type}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    <time dateTime={item.editionDate}>
                      {format(parseISO(item.editionDate), 'd MMM yyyy', {
                        locale: es
                      })}
                    </time>
                  </p>
                  {item.notes ? (
                    <p className='text-sm'>Notas: {item.notes}</p>
                  ) : null}
                  {item.participationNotes ? (
                    <p className='text-sm'>
                      Notas de participación: {item.participationNotes}
                    </p>
                  ) : null}
                </ItemContent>
              </Item>
            </li>
          ))}
        </ol>
      ) : (
        <p className='text-muted-foreground text-sm'>
          {kind === 'exhibition'
            ? 'Sin exposiciones registradas.'
            : 'Sin actividades registradas.'}
        </p>
      )}
    </section>
  )
}

function Timeline({ detail }: { detail: ArtistDetail }) {
  const count = detail.activityCount + detail.exhibitionCount
  return (
    <section aria-labelledby='artist-participations-title' className='min-w-0'>
      <Card size='sm' className='min-w-0'>
        <CardHeader>
          <h3
            id='artist-participations-title'
            className='text-base font-semibold'
          >
            {count} {count === 1 ? 'Participación' : 'Participaciones'}
          </h3>
        </CardHeader>
        <CardContent className='min-w-0'>
          {!detail.activities.length && !detail.exhibitions.length ? (
            <Empty className='bg-muted/30 p-6'>
              <EmptyTitle>Sin participaciones</EmptyTitle>
              <EmptyDescription>
                Sin participaciones registradas.
              </EmptyDescription>
            </Empty>
          ) : (
            <div className='grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2'>
              <ParticipationList items={detail.exhibitions} kind='exhibition' />
              <ParticipationList items={detail.activities} kind='activity' />
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

export function ArtistDetailDialog() {
  const artist = useArtistDialog((s) => s.selectedDetailArtist)
  const isOpen = useArtistDialog((s) => s.isArtistDetailOpen)
  const detail = useArtistDialog((s) => s.artistDetail)
  const loading = useArtistDialog((s) => s.isDetailLoading)
  const error = useArtistDialog((s) => s.detailError)
  const close = useArtistDialog((s) => s.closeArtistDetailDialog)
  if (!artist) return null

  const avatar = detail?.images.find((image) => image.type === 'avatar')
  const gallery =
    detail?.images.filter((image) => image.type === 'galeria') ?? []
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent
        className='max-h-[90dvh] min-w-0 grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-5xl'
        aria-describedby='artist-cv-description'
      >
        <DialogHeader className='min-w-0 border-b px-6 py-5 pr-12'>
          <DialogTitle className='[overflow-wrap:anywhere]'>
            Ficha de artista: {artist.pseudonimo}
          </DialogTitle>
          <DialogDescription id='artist-cv-description'>
            Ficha de artista, imágenes y participaciones.
          </DialogDescription>
        </DialogHeader>
        <div className='grid min-h-0 min-w-0 gap-6 overflow-y-auto overscroll-contain p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]'>
          <div className='min-w-0 space-y-6'>
            {avatar ? (
              <Image
                src={avatar.url}
                alt={`Retrato de ${artist.pseudonimo}`}
                width={800}
                height={800}
                unoptimized
                className='h-auto w-full rounded-lg'
              />
            ) : null}
            <Profile artist={artist} />
          </div>
          <div className='min-w-0 space-y-6' aria-live='polite'>
            {loading ? (
              <Empty className='bg-muted/30 p-6'>
                <EmptyTitle>Preparando ficha</EmptyTitle>
                <EmptyDescription role='status'>
                  Cargando detalle del artista…
                </EmptyDescription>
              </Empty>
            ) : error ? (
              <Empty className='border-destructive/40 bg-destructive/5 p-6'>
                <EmptyTitle>Detalle no disponible</EmptyTitle>
                <EmptyDescription role='alert'>{error}</EmptyDescription>
              </Empty>
            ) : detail ? (
              <>
                <section
                  aria-labelledby='artist-gallery-title'
                  className='min-w-0'
                >
                  <Card size='sm' className='min-w-0'>
                    <CardHeader>
                      <h3
                        id='artist-gallery-title'
                        className='text-base font-semibold'
                      >
                        Galería
                      </h3>
                    </CardHeader>
                    <CardContent className='min-w-0'>
                      {gallery.length ? (
                        <ul className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                          {gallery.map((image, index) => (
                            <li key={image.id} className='min-w-0'>
                              <Image
                                src={image.url}
                                alt={`Obra ${index + 1} de ${artist.pseudonimo}`}
                                width={240}
                                height={180}
                                unoptimized
                                className='aspect-4/3 w-full rounded-lg object-cover'
                              />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Empty className='bg-muted/30 p-6'>
                          <EmptyTitle>Galería vacía</EmptyTitle>
                          <EmptyDescription>
                            Sin imágenes en la galería.
                          </EmptyDescription>
                        </Empty>
                      )}
                    </CardContent>
                  </Card>
                </section>
                <Timeline detail={detail} />
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
