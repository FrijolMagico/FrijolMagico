'use client'

import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { Switch } from '@/shared/components/ui/switch'
import { updateEditionPublicationAction } from '../_actions/update-edition-publication.action'

interface EditionPublicationSwitchProps {
  edition: {
    id: number
    published: boolean
  }
}

export function EditionPublicationSwitch({
  edition
}: EditionPublicationSwitchProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticPublished, setOptimisticPublished] = useOptimistic(
    edition.published
  )

  const handleCheckedChange = (published: boolean) => {
    startTransition(async () => {
      setOptimisticPublished(published)

      const result = await updateEditionPublicationAction({
        id: edition.id,
        published
      })

      if (!result.success) {
        toast.error('No se pudo actualizar la publicación')
      }
    })
  }

  return (
    <div className='flex items-center gap-2'>
      <Switch
        checked={optimisticPublished}
        onCheckedChange={handleCheckedChange}
        disabled={isPending}
        aria-label='Publicar edición'
      />
      <span className='text-muted-foreground text-sm'>Publicada</span>
    </div>
  )
}
