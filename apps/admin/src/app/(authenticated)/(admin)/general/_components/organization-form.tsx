'use client'

import { useEffect } from 'react'
import { useOrganizationEffectiveData } from '../_hooks/use-organization-ui'
import { useAutoJournal } from '@/shared/ui-state/entity-state/hooks/use-auto-journal'
import { RawOrganization } from '../_types'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { RichTextarea } from '@/shared/components/rich-textarea'
import {
  useOrganizationUIStore,
  writeOrganizationJournal
} from '../_store/organization-ui-store'

interface OrganizationFormProps {
  initialData: RawOrganization
}

export function OrganizationForm({ initialData }: OrganizationFormProps) {
  const update = useOrganizationUIStore((state) => state.update)
  const commitCurrentEdits = useOrganizationUIStore(
    (state) => state.commitCurrentEdits
  )
  const setRemoteData = useOrganizationUIStore((state) => state.setRemoteData)

  const organization = useOrganizationEffectiveData()

  // Problemas con este componente:
  // Cada vez que editamos 1 campo, cualquiera de los definidos acá
  // provoca un re renderizado de todos, este componetne rereneriza cada vez que presionamos un botón,
  // Esto debeía ser manejado de manera independiente en cada componente?
  // Quizá de esta manera podemos manejar operaciones de manera atómica, de modo de pasarle al writeToJournal la información precisa de la operación

  const { handleChange, handleBlur } = useAutoJournal({
    data: organization,
    actions: {
      update,
      save: async (data, id) => {
        await writeOrganizationJournal({
          type: 'UPDATE',
          entityId: id ?? 0,
          data,
          timestamp: Date.now(),
          isOptimistic: !id
        }) // Guardamos en Journal <- necesitamos la operation
        commitCurrentEdits() // Guardamos en appliedChanges, deberíamos controlar si la operacion de escribir en journal salió bien y sólo ahí ejecutar el commit
      }
    }
  })

  // Podemos definir el inizializador de la data como un customhook para implementarlo en algún otro nivel de manera separada
  // De esta manera, y si se paramos la reactividad a cada componente, este podría hasta ser un server component
  useEffect(() => {
    setRemoteData([initialData])
  }, [initialData, setRemoteData])

  const data = organization || initialData

  console.log('(UI)[OrganizationForm]: ', {
    organization
  })

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='nombre'>Nombre de la Organización</Label>
        <Input
          id='nombre'
          value={data.nombre || ''}
          onChange={(e) => handleChange('nombre', e.currentTarget.value, null)}
          onBlur={() => handleBlur('nombre', data.nombre || '', null)}
          placeholder='Frijol Mágico'
          className='w-full'
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='descripcion'>Descripción</Label>
        <Textarea
          id='descripcion'
          value={data.descripcion || ''}
          onChange={(e) =>
            handleChange('descripcion', e.currentTarget.value, null)
          }
          onBlur={() => handleBlur('descripcion', data.descripcion || '', null)}
          placeholder='Describe la organización...'
          className='field-sizing-content! min-h-42'
          rows={2}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='mision'>Misión</Label>
        <RichTextarea
          id='mision'
          value={data.mision || ''}
          onChange={(value: string) => handleChange('mision', value, null)}
          onBlur={() => handleBlur('mision', data.mision || '', null)}
          placeholder='Nuestra misión es...'
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='vision'>Visión</Label>
        <RichTextarea
          id='vision'
          value={data.vision || ''}
          onChange={(value: string) => handleChange('vision', value, null)}
          onBlur={() => handleBlur('vision', data.vision || '', null)}
          placeholder='Nuestra visión es...'
        />
      </div>
    </div>
  )
}
