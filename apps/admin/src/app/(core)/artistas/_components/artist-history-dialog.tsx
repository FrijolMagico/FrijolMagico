'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  IconMail,
  IconUser,
  IconMapPin,
  IconLink,
  IconPlus
} from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { useArtistDialog } from '../_store/artist-dialog-store'
import { insertArtistHistoryItemAction } from '../_actions/insert-artist-history.action'
import type { InsertHistoryFormInput } from '../_actions/insert-artist-history.action'

interface HistoryConceptProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  items: string[]
  showAdd?: boolean
  fieldName?: string
  setPendingField?: (name: string, value: string) => void
  toggleAdd?: () => void
  pendingValue?: string
}

function HistoryConcept({
  icon: Icon,
  title,
  items,
  showAdd,
  fieldName,
  setPendingField,
  toggleAdd,
  pendingValue
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
          {items.map((item, idx) => (
            <Badge key={idx} variant='secondary' className='text-xs font-normal'>
              {item}
            </Badge>
          ))}
        </div>
      )}
      {showAdd && fieldName && setPendingField && (
        <div className='pl-5'>
          <Input
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
  rrssPlatform,
  rrssUrl,
  onPlatformChange,
  onUrlChange
}: {
  items: Record<string, string[]>
  showAdd?: boolean
  toggleAdd?: () => void
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
      )}
      {showAdd && (
        <div className='flex flex-col gap-2 pl-5'>
          <Input
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
  closeDialog
}: {
  history: NonNullable<ReturnType<typeof useArtistDialog.getState>['selectedArtistHistory']>
  artistId: number
  closeDialog: () => void
}) {
  const router = useRouter()

  const [pendingFields, setPendingFields] = useState<Record<string, string>>({})
  const [rrssOpen, setRrssOpen] = useState(false)
  const [rrssPlatform, setRrssPlatform] = useState('')
  const [rrssUrl, setRrssUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const setPendingField = (name: string, value: string) => {
    setPendingFields((prev) => ({ ...prev, [name]: value }))
  }

  const hasPendingItems =
    Object.values(pendingFields).some((v) => v.trim().length > 0) ||
    (rrssPlatform.trim().length > 0 && rrssUrl.trim().length > 0)

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)

    const data: InsertHistoryFormInput = {
      artistaId: artistId
    }

    for (const key of ['pseudonimo', 'correo', 'ciudad', 'pais'] as const) {
      const value = pendingFields[key]
      if (value?.trim()) {
        data[key] = value.trim()
      }
    }

    if (rrssPlatform.trim() && rrssUrl.trim()) {
      data.rrss = {
        [rrssPlatform.trim().toLowerCase()]: [rrssUrl.trim()]
      }
    }

    const result = await insertArtistHistoryItemAction(data)

    if (!result.success) {
      const firstError =
        result.errors && result.errors.length > 0
          ? result.errors[0].message
          : 'Error al guardar'
      setSaveError(firstError)
      setIsSaving(false)
      return
    }

    setIsSaving(false)
    toast.success('Elemento de historial agregado exitosamente')
    closeDialog()
    router.refresh()
  }

  return (
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
          showAdd={'pseudonimo' in pendingFields}
          fieldName='pseudonimo'
          setPendingField={setPendingField}
          toggleAdd={() => setPendingField('pseudonimo', '')}
          pendingValue={pendingFields['pseudonimo']}
        />

        {history.correos.length > 0 && <Separator className='opacity-50' />}
        <HistoryConcept
          icon={IconMail}
          title='Correos'
          items={history.correos}
          showAdd={'correo' in pendingFields}
          fieldName='correo'
          setPendingField={setPendingField}
          toggleAdd={() => setPendingField('correo', '')}
          pendingValue={pendingFields['correo']}
        />

        {(history.ciudades.length > 0 || history.paises.length > 0) && (
          <Separator className='opacity-50' />
        )}
        <HistoryConcept
          icon={IconMapPin}
          title='Ubicaciones'
          items={[...history.ciudades, ...history.paises].filter(Boolean)}
          showAdd={'ciudad' in pendingFields || 'pais' in pendingFields}
          toggleAdd={() => {
            setPendingField('ciudad', '')
            setPendingField('pais', '')
          }}
        />
        {('ciudad' in pendingFields || 'pais' in pendingFields) && (
          <div className='flex flex-col gap-2 pl-5'>
            <Input
              placeholder='Ciudad'
              value={pendingFields['ciudad'] ?? ''}
              onChange={(e) => setPendingField('ciudad', e.target.value)}
            />
            <Input
              placeholder='País'
              value={pendingFields['pais'] ?? ''}
              onChange={(e) => setPendingField('pais', e.target.value)}
            />
          </div>
        )}

        {Object.keys(history.rrss).length > 0 && (
          <Separator className='opacity-50' />
        )}
        <HistoryRrssConcept
          items={history.rrss}
          showAdd={rrssOpen}
          toggleAdd={() => setRrssOpen(true)}
          rrssPlatform={rrssPlatform}
          rrssUrl={rrssUrl}
          onPlatformChange={setRrssPlatform}
          onUrlChange={setRrssUrl}
        />

        {hasPendingItems && (
          <div className='pt-2'>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
            {saveError && (
              <p className='mt-2 text-sm text-red-500'>{saveError}</p>
            )}
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
        closeDialog={closeHistoryDialog}
      />
    </Dialog>
  )
}
