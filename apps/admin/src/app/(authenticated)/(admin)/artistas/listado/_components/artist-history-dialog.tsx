'use client'

import { Mail, User, MapPin, Link as LinkIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { useArtistListViewStore } from '../_store/artist-list-view-store'
import { useHistoryByArtist } from '../_hooks/use-history-by-artist'
import { aggregateHistory } from '../_lib/aggregate-history'
import { useArtistsProjectionStore } from '../../_store/artista-ui-store'

function HistoryConcept({
  icon: Icon,
  title,
  items
}: {
  icon: any
  title: string
  items: string[]
}) {
  if (items.length === 0) return null

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center gap-1.5 text-sm font-medium text-foreground'>
        <Icon className='h-4 w-4 text-muted-foreground' />
        {title}
      </div>
      <div className='flex flex-wrap gap-1.5 pl-5'>
        {items.map((item, idx) => (
          <Badge key={idx} variant='secondary' className='font-normal text-xs'>
            {item}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function HistoryRrssConcept({ items }: { items: Record<string, string>[] }) {
  if (items.length === 0) return null

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center gap-1.5 text-sm font-medium text-foreground'>
        <LinkIcon className='h-4 w-4 text-muted-foreground' />
        Redes Sociales
      </div>
      <div className='flex flex-col gap-1.5 pl-5'>
        {items.map((rrssSet, idx) => (
          <div key={idx} className='bg-muted/30 rounded-md p-2 text-xs'>
            {Object.entries(rrssSet).map(([platform, url]) => (
              <div key={platform} className='grid grid-cols-[80px_1fr] gap-2'>
                <span className='font-medium capitalize text-muted-foreground'>
                  {platform}:
                </span>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className='text-primary hover:underline truncate'
                >
                  {url}
                </a>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ArtistHistoryDialog() {
  const isOpen = useArtistListViewStore((s) => s.historyDialogOpen)
  const closeHistoryDialog = useArtistListViewStore((s) => s.closeHistoryDialog)
  const artistId = useArtistListViewStore((s) => s.selectedHistoryArtistId)

  const artist = useArtistsProjectionStore((s) =>
    artistId ? s.byId[artistId] : null
  )

  const { historyByArtistId } = useHistoryByArtist()
  
  const records = artistId ? historyByArtistId.get(artistId) || [] : []
  const aggregated = aggregateHistory(records)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeHistoryDialog()}>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>
            Historial de {artist?.pseudonimo || 'Artista'}
          </DialogTitle>
        </DialogHeader>
        
        <div className='space-y-4 py-4'>
          <HistoryConcept
            icon={User}
            title='Pseudónimos'
            items={aggregated.pseudonimos}
          />
          
          {aggregated.correos.length > 0 && <Separator className='opacity-50' />}
          <HistoryConcept
            icon={Mail}
            title='Correos'
            items={aggregated.correos}
          />
          
          {(aggregated.ciudades.length > 0 || aggregated.paises.length > 0) && <Separator className='opacity-50' />}
          <HistoryConcept
            icon={MapPin}
            title='Ubicaciones'
            items={[...aggregated.ciudades, ...aggregated.paises].filter(Boolean)}
          />
          
          {aggregated.rrssList.length > 0 && <Separator className='opacity-50' />}
          <HistoryRrssConcept items={aggregated.rrssList} />
          
          {records.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              No hay registros históricos para este artista.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
