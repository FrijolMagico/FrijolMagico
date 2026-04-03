'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Input } from '@/shared/components/ui/input'
import { ControllerSwitch } from '@/shared/components/controller-switch'
import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'
import { Field, FieldLabel } from '@/shared/components/ui/field'

import { useCollectiveDraftStore } from '../_store/use-collective-draft-store'

const memberUpdateFormSchema = z.object({
  role: z.string(),
  active: z.boolean()
})

type MemberUpdateFormInput = z.infer<typeof memberUpdateFormSchema>

export function MemberUpdateDialog() {
  const member = useCollectiveDraftStore((state) => state.memberBeingEdited)
  const closeMemberUpdate = useCollectiveDraftStore(
    (state) => state.closeMemberUpdate
  )
  const updateMember = useCollectiveDraftStore((state) => state.updateMember)

  const methods = useForm<MemberUpdateFormInput>({
    resolver: zodResolver(memberUpdateFormSchema),
    values: {
      role: member?.role ?? '',
      active: member?.active ?? true
    },
    mode: 'onChange'
  })

  const handleSubmit = ({ role, active }: MemberUpdateFormInput) => {
    if (!member) {
      return
    }

    updateMember(member.artistId, {
      role: role.trim() || null,
      active
    })

    methods.reset()
    closeMemberUpdate()
  }

  return (
    <EntityFormDialog
      open={member !== null}
      onOpenChange={(open) => !open && closeMemberUpdate()}
      title='Editar miembro'
      description='Ajusta el rol y el estado del integrante seleccionado.'
      submit={{
        label: 'Guardar miembro',
        type: 'button',
        disabled: methods.formState.isSubmitting,
        isSubmitting: methods.formState.isSubmitting,
        onClick: methods.handleSubmit(handleSubmit)
      }}
    >
      <form className='space-y-4' onSubmit={methods.handleSubmit(handleSubmit)}>
        <Field className='space-y-2'>
          <FieldLabel htmlFor='member-update-role'>Rol</FieldLabel>
          <Input
            id='member-update-role'
            placeholder='Ej. Dirección artística'
            {...methods.register('role')}
          />
        </Field>

        <div className='flex items-center justify-between rounded-lg border p-3'>
          <div>
            <p className='font-medium'>Miembro activo</p>
            <p className='text-muted-foreground text-sm'>
              Definí si el integrante sigue activo dentro de la agrupación.
            </p>
          </div>

          <ControllerSwitch
            name='active'
            control={methods.control}
            label='Estado del miembro'
          />
        </div>
      </form>
    </EntityFormDialog>
  )
}
