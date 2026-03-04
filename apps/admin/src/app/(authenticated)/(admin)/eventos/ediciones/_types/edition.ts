export interface DayFormState {
  tempId: string
  fecha: string
  horaInicio: string
  horaFin: string
  modalidad: 'presencial' | 'online' | 'hibrido' | ''
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
