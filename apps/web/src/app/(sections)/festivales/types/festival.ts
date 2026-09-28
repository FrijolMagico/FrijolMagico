export interface FestivalLugar {
  nombre: string
  direccion: string
}

export interface FestivalDia {
  fecha: string
  hora_inicio: string
  hora_fin: string
  modalidad: 'presencial' | 'online' | 'hibrido'
  lugar: FestivalLugar | null
}

export interface FestivalTotalParticipantes {
  exponentes: number
  talleres: number
  musica: number
  charlas: number
}

export interface FestivalResumen {
  total_participantes: FestivalTotalParticipantes
  por_disciplina: Record<string, number>
}

export interface FestivalEvento {
  evento_id: number
  nombre: string
  slug: string
  edicion: string
  edicion_nombre: string | null
  edicion_slug: string
  poster_url: string | null
  dias: FestivalDia[]
}

export interface FestivalEdicion {
  evento: FestivalEvento
  resumen: FestivalResumen
}

export interface RawFestivalEdicion {
  resultado: string
}

export interface FestivalParticipant {
  pseudonimo: string
  disciplina_slug: string
  catalogo_slug: string | null
  rrss: string | null
  avatar_url?: string | null
}

export interface ActivityRegistration {
  url: string
  start_at: string
  end_at: string
}

export interface FestivalActivityOccurrence {
  fecha: string
  hora_inicio: string
  duracion_minutos: number
}

export interface FestivalActivity {
  titulo: string | null
  descripcion: string | null
  ubicacion: string | null
  ocurrencias: FestivalActivityOccurrence[]
  tipo: string
  participante_pseudonimo: string | null
  catalogo_slug?: string | null
  avatar_url?: string | null
  rrss?: string | null
  correo?: string | null
  registration: ActivityRegistration | null
}

export interface FestivalDetail {
  edition_id: number
  slug: string
  evento: {
    nombre: string
    slug: string
  }
  edicion_nombre: string | null
  numero_edicion: string
  poster_url: string | null
  edicion_fin: string | null
  is_edition_past: boolean
  dias: FestivalDia[]
  participantes: FestivalParticipant[]
  actividades: FestivalActivity[]
}

export interface RawFestivalDetail {
  resultado: string
}
