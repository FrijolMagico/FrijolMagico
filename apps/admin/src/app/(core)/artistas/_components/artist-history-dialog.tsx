'use client'

import { IconMail, IconUser, IconMapPin, IconLink } from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { useArtistDialog } from '../_store/artist-dialog-store'

interface HistoryConceptProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  items: string[]
}

function HistoryConcept({ icon: Icon, title, items }: HistoryConceptProps) {
  if (items.length === 0) return null

  return (
    <div className='space-y-1.5'>
      <div className='text-foreground flex items-center gap-1.5 text-sm font-medium'>
        <Icon className='text-muted-foreground h-4 w-4' />
        {title}
      </div>
      <div className='flex flex-wrap gap-1.5 pl-5'>
        {items.map((item, idx) => (
          <Badge key={idx} variant='secondary' className='text-xs font-normal'>
            {item}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function HistoryRrssConcept({ items }: { items: Record<string, string[]> }) {
  if (Object.keys(items).length === 0) return null

  return (
    <div className='space-y-1.5'>
      <div className='text-foreground flex items-center gap-1.5 text-sm font-medium'>
        <IconLink className='text-muted-foreground h-4 w-4' />
        Redes Sociales
      </div>
      <div className='flex flex-col gap-1.5 pl-5'>
        {Object.entries(items).map(([platform, urls]) => (
          <div key={platform} className='bg-muted/30 rounded-md p-2 text-xs'>
            <span className='text-muted-foreground font-medium capitalize'>
              {platform}:
            </span>
            <div className='mt-1 flex flex-col gap-0.5 pl-2'>
              {urls.map((url) => (
                <a
                  key={url}
                  href={url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary truncate hover:underline'
                >
                  {url}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ArtistHistoryDialog() {
  const isOpen = useArtistDialog((s) => s.isArtistHistoryOpen)
  const closeHistoryDialog = useArtistDialog((s) => s.closeArtistHistoryDialog)
  const history = useArtistDialog((s) => s.selectedArtistHistory)

  if (!history) return null

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && closeHistoryDialog()}
    >
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>
            Historial de {history.pseudonimo || 'Artista'}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <HistoryConcept
            icon={IconUser}
            title='Pseudónimos'
            items={history.pseudonimos}
          />

          {history.correos.length > 0 && <Separator className='opacity-50' />}
          <HistoryConcept
            icon={IconMail}
            title='Correos'
            items={history.correos}
          />

          {(history.ciudades.length > 0 || history.paises.length > 0) && (
            <Separator className='opacity-50' />
          )}
          <HistoryConcept
            icon={IconMapPin}
            title='Ubicaciones'
            items={[...history.ciudades, ...history.paises].filter(Boolean)}
          />

          {Object.keys(history.rrss).length > 0 && (
            <Separator className='opacity-50' />
          )}
          <HistoryRrssConcept items={history.rrss} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
