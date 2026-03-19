export type Modality = 'presencial' | 'online' | 'hibrido'

export function isModality(value: string): value is Modality {
  return value === 'presencial' || value === 'online' || value === 'hibrido'
}

export interface DayFormState {
  tempId: string
  fecha: string
  horaInicio: string
  horaFin: string
  modalidad: Modality | null
  lugarId: string | null
  existingId?: string
}

export interface EdicionFormState {
  eventoId: string
  numeroEdicion: string
  nombre: string
  days: DayFormState[]
}

export interface DayFieldErrors {
  fecha?: string
  horaInicio?: string
  horaFin?: string
  modalidad?: string
}

export interface FormErrors {
  eventoId: string | null
  numeroEdicion: string | null
  days: Record<string, DayFieldErrors>
}
