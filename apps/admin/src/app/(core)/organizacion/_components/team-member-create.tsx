'use client'

import { useForm, FormProvider, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createTeamMember } from '../_actions/team-member.action'
import {
  type TeamMemberFormInput,
  teamMemberFormSchema
} from '../_schemas/organizacion.schema'
import { TeamMemberFormFields } from './team-member-form-fields'
import { ADD_TEAM_FORM_ID } from '../_constants'
import { useTeamDialog } from '../_store/team-dialog-store'
import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'

export function TeamMemberCreate() {
  const isCreateMemberOpen = useTeamDialog((s) => s.isCreateMemberOpen)
  const toggleCreateMemberDialog = useTeamDialog(
    (s) => s.toggleCreateMemberDialog
  )

  const methods = useForm<TeamMemberFormInput>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: '',
      position: null,
      rut: null,
      email: '',
      phone: null,
      rrss: null
    },
    mode: 'onChange'
  })

  const { isDirty, isValid, isSubmitting } = useFormState({
    control: methods.control
  })

  const onSubmit = async (data: TeamMemberFormInput) => {
    let success = false
    try {
      const result = await createTeamMember({ success: false }, data)

      if (!result.success) {
        toast.error(
          result.errors
            ? result.errors.map((e) => e.message).join(', ')
            : 'Error al añadir al miembro del equipo'
        )
        return
      }

      success = true
      toast.success('Miembro del equipo añadido correctamente')
      methods.reset()
    } finally {
      if (success) {
        toggleCreateMemberDialog(false)
      }
    }
  }

  return (
    <FormProvider {...methods}>
      <EntityFormDialog
        open={isCreateMemberOpen}
        onOpenChange={toggleCreateMemberDialog}
        title='Agregar miembro del equipo'
        isDirty={isDirty}
        triggerLabel='Agregar miembro'
        submit={{
          form: ADD_TEAM_FORM_ID,
          isSubmitting,
          disabled: isSubmitting || !isDirty || !isValid
        }}
      >
        <form id={ADD_TEAM_FORM_ID} onSubmit={methods.handleSubmit(onSubmit)}>
          <TeamMemberFormFields />
        </form>
      </EntityFormDialog>
    </FormProvider>
  )
}
