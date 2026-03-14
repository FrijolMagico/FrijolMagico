'use client'

import { useEffect } from 'react'
import { useForm, FormProvider, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Badge } from '@/shared/components/ui/badge'
import { useTeamDialog } from '../_store/team-dialog-store'
import { updateTeamMember } from '../_actions/team-member.action'
import {
  type TeamMemberFormInput,
  teamMemberFormSchema
} from '../_schemas/organizacion.schema'
import { TeamMemberFormFields } from './team-member-form-fields'
import { UPDATE_TEAM_FORM_ID } from '../_constants'

export function TeamMemberUpdate() {
  const editingMember = useTeamDialog((s) => s.editingMember)
  const close = useTeamDialog((s) => s.close)

  // Compute form values from editing member
  // React Compiler handles memoization automatically
  const formValues: TeamMemberFormInput = {
    name: editingMember?.name ?? '',
    position: editingMember?.position ?? '',
    rut: editingMember?.rut ?? '',
    email: editingMember?.email ?? '',
    phone: editingMember?.phone ?? '',
    rrss: editingMember?.rrss ?? null
  }

  const methods = useForm<TeamMemberFormInput>({
    resolver: zodResolver(teamMemberFormSchema),
    values: formValues,
    mode: 'onChange'
  })

  const { isDirty, isValid, isSubmitting } = useFormState({
    control: methods.control
  })

  const onSubmit = async (data: TeamMemberFormInput) => {
    if (!editingMember?.id) {
      toast.error('No se ha seleccionado ningún miembro del equipo')
      return
    }

    const result = await updateTeamMember(
      { success: false },
      { id: editingMember.id, ...data }
    )

    if (!result.success) {
      toast.error(
        result.errors
          ? result.errors.map((e) => e.message).join(', ')
          : 'Error al actualizar el miembro del equipo'
      )
      return
    }

    close()
    toast.success('Miembro del equipo actualizado correctamente')
  }

  return (
    <FormProvider {...methods}>
      <Dialog
        open={!!editingMember}
        onOpenChange={(open) => {
          if (!open) close()
        }}
      >
        <DialogContent>
          {isDirty && (
            <Badge className='absolute -top-2 -left-6 ml-2 -rotate-6'>
              Editado
            </Badge>
          )}
          <DialogHeader>
            <DialogTitle>
              Actualizar información del miembro del equipo
            </DialogTitle>
          </DialogHeader>

          <form
            id={UPDATE_TEAM_FORM_ID}
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <TeamMemberFormFields />
          </form>

          <DialogFooter>
            <Button variant='outline' onClick={() => close()}>
              Cerrar
            </Button>
            <Button
              type='submit'
              form={UPDATE_TEAM_FORM_ID}
              disabled={!isDirty || !isValid || isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  )
}
