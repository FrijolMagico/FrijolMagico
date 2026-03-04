'use client'

import { useState } from 'react'
import { ORGANIZATION_ID } from '../_constants'
import { useTeamDialog } from '../_store/team-dialog-store'
import {
  useTeamOperationStore,
  useTeamProjectionStore
} from '../_store/organization-team-ui-store'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import { RRSSManager } from '@/shared/components/rrss-manager/rrss-manager'
import { equipoFormSchema } from '../_schemas/organizacion.schema'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { TeamMember } from '../_types'
import { ProjectedEntity } from '@/shared/operations/projection'
import { FieldGroup } from '@/shared/components/ui/field'
import { Field, FieldLabel, FieldError } from '@/shared/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/shared/components/ui/input-group'

interface AddEquipoFormContentProps {
  onApply: (data: Omit<TeamMember, 'id' | 'organizationId'>) => void
  onCancel: () => void
  member: ProjectedEntity<TeamMember> | null
}

function MemberFormContent({
  onApply,
  onCancel,
  member
}: AddEquipoFormContentProps) {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    position: member?.position || '',
    rut: member?.rut || '',
    email: member?.email || '',
    phone: member?.phone || '',
    rrss: member?.rrss || null
  })

  const [errors, setErrors] = useState<{ name?: string }>({})

  const handleApply = () => {
    setErrors({})

    const result = equipoFormSchema.safeParse(formData)

    if (!result.success) {
      setErrors({
        name: result.error.name
      })
      return
    }

    onApply(formData)
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor='name'>
          Nombre <span className='text-destructive'>*</span>
        </FieldLabel>
        <Input
          id='name'
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder='Nombre completo'
          aria-invalid={!!errors.name}
        />
        {errors.name && <FieldError>{errors.name}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor='position'>Cargo</FieldLabel>
        <Input
          id='position'
          value={formData.position}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, position: e.target.value }))
          }
          placeholder='Ej. Director'
        />
      </Field>

      <div className='grid grid-cols-2 gap-4'>
        <Field>
          <FieldLabel htmlFor='rut'>RUT</FieldLabel>
          <Input
            id='rut'
            value={formData.rut}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, rut: e.target.value }))
            }
            placeholder='12.345.678-9'
          />
        </Field>
        <Field>
          <FieldLabel htmlFor='phone'>Teléfono</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id='phone'
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder='912345678'
            />
            <InputGroupAddon>+56</InputGroupAddon>
          </InputGroup>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor='email'>Email</FieldLabel>
        <Input
          id='email'
          type='email'
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder='correo@ejemplo.com'
        />
      </Field>

      <RRSSManager
        values={formData.rrss || {}}
        onChange={(rrss) =>
          setFormData((prev) => {
            return { ...prev, rrss }
          })
        }
      />

      <div className='flex justify-end gap-2 pt-4'>
        <Button variant='outline' onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleApply}>
          {member ? 'Guardar cambios' : 'Agregar miembro'}
        </Button>
      </div>
    </FieldGroup>
  )
}

export function MemberDialog() {
  const memberId = useTeamDialog((s) => s.selectedMemberId)
  const member = useTeamProjectionStore((s) =>
    memberId ? s.byId[memberId] : null
  )

  const isOpen = useTeamDialog((s) => s.isDialogOpen)
  const close = useTeamDialog((s) => s.closeDialog)
  const add = useTeamOperationStore((s) => s.add)
  const update = useTeamOperationStore((s) => s.update)

  const handleApply = (data: {
    name: string
    position?: string
    rut?: string
    email?: string
    phone?: string
    rrss: Record<string, string[]> | null
  }) => {
    if (memberId) {
      update(memberId, {
        ...data,
        organizationId: member?.organizationId ?? ORGANIZATION_ID
      })
    }

    if (!memberId) add({ ...data, organizationId: ORGANIZATION_ID })

    close()
  }

  return (
    <EntityFormDialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      title='Agregar Miembro del Equipo'
    >
      {isOpen && (
        <MemberFormContent
          onApply={handleApply}
          onCancel={close}
          member={member}
        />
      )}
    </EntityFormDialog>
  )
}
