'use client'

import { useForm, FormProvider, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useTeamDialog } from '../_store/team-dialog-store'
import { updateTeamMember } from '../_actions/team-member.action'
import {
  type TeamMemberFormInput,
  teamMemberFormSchema
} from '../_schemas/organizacion.schema'
import { TeamMemberFormFields } from './team-member-form-fields'
import { UPDATE_TEAM_FORM_ID } from '../_constants'
import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'

export function TeamMemberUpdate() {
  const selectedMember = useTeamDialog((s) => s.selectedMember)
  const closeUpdateMemberDialog = useTeamDialog(
    (s) => s.closeUpdateMemberDialog
  )

  const methods = useForm<TeamMemberFormInput>({
    resolver: zodResolver(teamMemberFormSchema),
    values: {
      name: selectedMember?.name || '',
      position: selectedMember?.position || null,
      rut: selectedMember?.rut || null,
      email: selectedMember?.email || '',
      phone: selectedMember?.phone || null,
      rrss: selectedMember?.rrss || null
    },
    mode: 'onChange'
  })

  const { isDirty, isValid, isSubmitting } = useFormState({
    control: methods.control
  })

  const onSubmit = async (data: TeamMemberFormInput) => {
    if (!selectedMember?.id) {
      toast.error('No se ha seleccionado ningún miembro del equipo')
      return
    }

    let success = false
    try {
      const result = await updateTeamMember(
        { success: false },
        { id: selectedMember.id, ...data }
      )

      if (!result.success) {
        toast.error(
          result.errors
            ? result.errors.map((e) => e.message).join(', ')
            : 'Error al actualizar el miembro del equipo'
        )
        return
      }

      success = true
      toast.success('Miembro del equipo actualizado correctamente')
      methods.reset()
    } finally {
      if (success) {
        closeUpdateMemberDialog()
      }
    }
  }

  return (
    <FormProvider {...methods}>
      <EntityFormDialog
        open={!!selectedMember}
        onOpenChange={(open) => {
          if (!open) closeUpdateMemberDialog()
        }}
        title='Actualizar información del miembro del equipo'
        isDirty={isDirty}
        submit={{
          type: 'submit',
          isSubmitting,
          disabled: isSubmitting || !isDirty || !isValid,
          form: UPDATE_TEAM_FORM_ID
        }}
      >
        <form
          id={UPDATE_TEAM_FORM_ID}
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <TeamMemberFormFields />
        </form>
      </EntityFormDialog>
    </FormProvider>
  )
}
