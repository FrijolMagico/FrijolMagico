'use client'

import {
  IconMail,
  IconUser,
  IconMapPin,
  IconLink,
  IconPlus,
  IconX,
} from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { useArtistDialog } from '../_store/artist-dialog-store'
import { useArtistHistory } from '../_hooks/use-artist-history'
import type { HistoryFieldEntry } from '../_lib/aggregate-history'

interface HistoryConceptProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  items: HistoryFieldEntry[]
  fieldName?: string
  onDelete?: (entry: HistoryFieldEntry) => void
  showAdd?: boolean
  setPendingField?: (name: string, value: string) => void
  toggleAdd?: () => void
  pendingValue?: string
}

function HistoryConcept({
  icon: Icon,
  title,
  items,
  showAdd,
  onDelete,
  fieldName,
  setPendingField,
  toggleAdd,
  pendingValue,
}: HistoryConceptProps) {
  return (
    <div className='space-y-1.5'>
      <div className='text-foreground flex items-center gap-1.5 text-sm font-medium'>
        <Icon className='text-muted-foreground h-4 w-4' />
        {title}
        <div className='ml-auto'>
          {!showAdd && (
            <button
              type='button'
              onClick={toggleAdd}
              aria-label={`Agregar ${title.toLowerCase()}`}
              className='text-muted-foreground hover:text-foreground'
            >
              <IconPlus className='h-4 w-4' />
            </button>
          )}
        </div>
      </div>
      {items.length > 0 && (
        <div className='flex flex-wrap gap-1.5 pl-5'>
          {items.map((entry) => (
            <Badge
              key={`${entry.historyId}-${entry.value}`}
              variant='secondary'
              className='flex items-center gap-1 pr-1 text-xs font-normal'
            >
              {entry.value}
              {onDelete && (
                <button
                  type='button'
                  onClick={() => onDelete(entry)}
                  aria-label={`Eliminar ${title.toLowerCase()}: ${entry.value}`}
                  className='text-muted-foreground hover:text-destructive'
                >
                  <IconX className='h-3 w-3' />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
      {showAdd && fieldName && setPendingField && (
        <div className='pl-5'>
          <Input
            autoFocus
            value={pendingValue ?? ''}
            onChange={(e) => setPendingField(fieldName, e.target.value)}
          />
        </div>
      )}
    </div>
  )
}

function HistoryRrssConcept({
  items,
  showAdd,
  toggleAdd,
  onDelete,
  rrssPlatform,
  rrssUrl,
  onPlatformChange,
  onUrlChange,
}: {
  items: Record<string, HistoryFieldEntry[]>
  showAdd?: boolean
  toggleAdd?: () => void
  onDelete?: (entry: HistoryFieldEntry) => void
  rrssPlatform?: string
  rrssUrl?: string
  onPlatformChange?: (v: string) => void
  onUrlChange?: (v: string) => void
}) {
  const hasItems = Object.keys(items).length > 0

  return (
    <div className='space-y-1.5'>
      <div className='text-foreground flex items-center gap-1.5 text-sm font-medium'>
        <IconLink className='text-muted-foreground h-4 w-4' />
        Redes Sociales
        <div className='ml-auto'>
          {!showAdd && (
            <button
              type='button'
              onClick={toggleAdd}
              aria-label='Agregar redes sociales'
              className='text-muted-foreground hover:text-foreground'
            >
              <IconPlus className='h-4 w-4' />
            </button>
          )}
        </div>
      </div>
      {hasItems && (
        <div className='flex flex-col gap-1.5 pl-5'>
          {Object.entries(items).map(([platform, entries]) => (
            <div key={platform} className='bg-muted/30 rounded-md p-2 text-xs'>
              <span className='text-muted-foreground font-medium capitalize'>
                {platform}:
              </span>
              <div className='mt-1 flex flex-col gap-0.5 pl-2'>
                {entries.map((entry) => (
                  <div
                    key={`${entry.historyId}-${entry.value}`}
                    className='flex items-center gap-1'
                  >
                    <a
                      href={entry.value}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-primary truncate hover:underline'
                    >
                      {entry.value}
                    </a>
                    {onDelete && (
                      <button
                        type='button'
                        onClick={() => onDelete(entry)}
                        aria-label={`Eliminar enlace de ${platform}`}
                        className='text-muted-foreground hover:text-destructive shrink-0'
                      >
                        <IconX className='h-3 w-3' />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {showAdd && (
        <div className='flex flex-col gap-2 pl-5'>
          <Input
            autoFocus
            placeholder='Plataforma'
            value={rrssPlatform ?? ''}
            onChange={(e) => onPlatformChange?.(e.target.value)}
          />
          <Input
            placeholder='URL'
            value={rrssUrl ?? ''}
            onChange={(e) => onUrlChange?.(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}

function ArtistHistoryDialogContent({
  history,
  artistId,
}: {
  history: NonNullable<
    ReturnType<typeof useArtistDialog.getState>['selectedArtistHistory']
  >
  artistId: number
}) {
  const {
    optimisticHistory,
    form,
    saveError,
    setPendingField,
    openRrssAdd,
    setRrssPlatform,
    setRrssUrl,
    hasPendingItems,
    handleSave,
    handleDelete,
    handleDeleteRrss,
  } = useArtistHistory(history, artistId)

  return (
    <DialogContent className='max-w-xl'>
      <DialogHeader>
        <DialogTitle>
          Historial de {optimisticHistory.pseudonimo || 'Artista'}
        </DialogTitle>
      </DialogHeader>

      <div className='space-y-4 py-4'>
        <HistoryConcept
          icon={IconUser}
          title='Pseudónimos'
          items={optimisticHistory.pseudonimos}
          onDelete={handleDelete}
          showAdd={'pseudonimo' in form.pendingFields}
          fieldName='pseudonimo'
          setPendingField={setPendingField}
          toggleAdd={() => setPendingField('pseudonimo', '')}
          pendingValue={form.pendingFields['pseudonimo']}
        />

        {optimisticHistory.correos.length > 0 && (
          <Separator className='opacity-50' />
        )}
        <HistoryConcept
          icon={IconMail}
          title='Correos'
          items={optimisticHistory.correos}
          onDelete={handleDelete}
          showAdd={'correo' in form.pendingFields}
          fieldName='correo'
          setPendingField={setPendingField}
          toggleAdd={() => setPendingField('correo', '')}
          pendingValue={form.pendingFields['correo']}
        />

        {(optimisticHistory.ciudades.length > 0 ||
          optimisticHistory.paises.length > 0) && (
          <Separator className='opacity-50' />
        )}
        <HistoryConcept
          icon={IconMapPin}
          title='Ubicaciones'
          items={[...optimisticHistory.ciudades, ...optimisticHistory.paises]}
          onDelete={handleDelete}
          showAdd={
            'ciudad' in form.pendingFields || 'pais' in form.pendingFields
          }
          toggleAdd={() => {
            setPendingField('ciudad', '')
            setPendingField('pais', '')
          }}
        />
        {('ciudad' in form.pendingFields || 'pais' in form.pendingFields) && (
          <div className='flex flex-col gap-2 pl-5'>
            <Input
              autoFocus
              placeholder='Ciudad'
              value={form.pendingFields['ciudad'] ?? ''}
              onChange={(e) => setPendingField('ciudad', e.target.value)}
            />
            <Input
              placeholder='País'
              value={form.pendingFields['pais'] ?? ''}
              onChange={(e) => setPendingField('pais', e.target.value)}
            />
          </div>
        )}

        {Object.keys(optimisticHistory.rrss).length > 0 && (
          <Separator className='opacity-50' />
        )}
        <HistoryRrssConcept
          items={optimisticHistory.rrss}
          onDelete={handleDeleteRrss}
          showAdd={form.rrssOpen}
          toggleAdd={openRrssAdd}
          rrssPlatform={form.rrssPlatform}
          rrssUrl={form.rrssUrl}
          onPlatformChange={setRrssPlatform}
          onUrlChange={setRrssUrl}
        />

        {hasPendingItems && (
          <div className='flex justify-end pt-2'>
            <div>
              <Button onClick={handleSave}>Guardar cambios</Button>
              {saveError && (
                <p className='mt-2 text-sm text-right text-red-500'>
                  {saveError}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  )
}

export function ArtistHistoryDialog() {
  const isOpen = useArtistDialog((s) => s.isArtistHistoryOpen)
  const artistId = useArtistDialog((s) => s.selectedArtistId)
  const closeHistoryDialog = useArtistDialog((s) => s.closeArtistHistoryDialog)
  const history = useArtistDialog((s) => s.selectedArtistHistory)

  if (!history || !artistId) return null

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && closeHistoryDialog()}
    >
      <ArtistHistoryDialogContent
        key={artistId}
        history={history}
        artistId={artistId}
      />
    </Dialog>
  )
}
