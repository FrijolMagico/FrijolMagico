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
}

export interface FestivalResumen {
  total_participantes: FestivalTotalParticipantes
  por_disciplina: Record<string, number>
}

export interface FestivalEvento {
  nombre: string
  slug: string
  edicion: string
  edicion_nombre: string | null
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
