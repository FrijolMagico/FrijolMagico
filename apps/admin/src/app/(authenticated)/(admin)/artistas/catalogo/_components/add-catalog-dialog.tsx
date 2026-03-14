'use client'

import { useForm, Controller } from 'react-hook-form'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import { Button } from '@/shared/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '@/shared/components/ui/combobox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/shared/components/ui/field'
import { Switch } from '@/shared/components/ui/switch'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import { IconPlus } from '@tabler/icons-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { catalogInsertSchema } from '../_schemas/catalogo.schema'
import { addCatalogAction } from '../_actions/add-catalog.action'
import type { CatalogAddFormInput } from '../_schemas/catalogo.schema'
import { toast } from 'sonner'
import { useCatalogDialog } from '../_store/catalog-dialog-store'

const INITIAL_FORM_DATA: CatalogAddFormInput = {
  artistaId: 0,
  descripcion: null,
  destacado: false,
  activo: true,
  avatarUrl: null
}

interface AddCatalogDialogProps {
  artists: { id: number; pseudonimo: string }[]
}

export function AddCatalogDialog({ artists }: AddCatalogDialogProps) {
  const isCreateCatalogOpen = useCatalogDialog((s) => s.isCreateCatalogOpen)
  const toggleDialog = useCatalogDialog((s) => s.toggleCreateCatalogDialog)

  const {
    formState: { isValid, isDirty, errors, isSubmitting },
    register,
    reset,
    control,
    handleSubmit
  } = useForm({
    resolver: zodResolver(catalogInsertSchema.omit({ orden: true })),
    defaultValues: INITIAL_FORM_DATA,
    mode: 'onChange'
  })

  const onSubmit = async (data: CatalogAddFormInput) => {
    try {
      const result = await addCatalogAction({ success: false }, data)

      if (!result.success) {
        toast.error(
          result.errors?.[0]?.message ?? 'Error al agregar al catálogo'
        )
        return
      }

      toggleDialog(false)
      toast.success('Artista agregado al catálogo')
    } finally {
      reset()
    }
  }

  return (
    <EntityFormDialog
      open={isCreateCatalogOpen}
      onOpenChange={toggleDialog}
      title='Agregar al Catálogo'
      trigger={
        <Button size='sm' variant='outline'>
          <IconPlus />
          Agregar al catálogo
        </Button>
      }
      footer={{
        close: (
          <Button type='button' variant='outline' disabled={isSubmitting}>
            Cancelar
          </Button>
        ),
        submit: (
          <Button type='submit' disabled={!isDirty || !isValid || isSubmitting}>
            {isSubmitting ? 'Agregando...' : 'Agregar al catálogo'}
          </Button>
        )
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className='pt-4'>
          <Field>
            <FieldLabel>
              Artista <span className='text-destructive'>*</span>
            </FieldLabel>
            <Controller
              name='artistaId'
              control={control}
              render={({ field }) => (
                <Combobox
                  items={artists}
                  value={
                    field.value
                      ? {
                          value: field.value,
                          label: artists.find((i) => i.id === field.value)
                            ?.pseudonimo
                        }
                      : null
                  }
                  onValueChange={(item) => field.onChange(item?.value ?? '')}
                  isItemEqualToValue={(item, val) => item.value === val.value}
                >
                  <ComboboxInput placeholder='Buscar artista...' showTrigger />
                  <ComboboxContent>
                    <ComboboxEmpty>
                      No hay artistas disponibles para agregar
                    </ComboboxEmpty>
                    <ComboboxList>
                      {artists.map((item) => (
                        <ComboboxItem key={item.id} value={item}>
                          {item.pseudonimo}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              )}
            />
            {errors.artistaId && (
              <FieldError>{errors.artistaId.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='descripcion'>Descripción</FieldLabel>
            <Textarea
              id='descripcion'
              {...register('descripcion')}
              placeholder='Descripción del artista para el catálogo...'
              className='min-h-32'
            />
          </Field>

          <div className='flex items-center justify-center gap-6 py-4'>
            <div className='flex items-center gap-2'>
              <Controller
                name='destacado'
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label>Destacado</Label>
            </div>
            <div className='flex items-center gap-2'>
              <Controller
                name='activo'
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label>Activo</Label>
            </div>
          </div>
        </FieldGroup>
      </form>
    </EntityFormDialog>
  )
}
