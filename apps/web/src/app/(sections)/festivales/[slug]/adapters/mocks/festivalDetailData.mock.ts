import type { FestivalDetail } from '../../../types/festival'

const mockDetails: Record<string, FestivalDetail> = {
  'edicion-xv-1': {
    edition_id: 15,
    slug: 'edicion-xv-1',
    evento: {
      nombre: 'Festival Frijol Mágico',
      slug: 'frijol-magico'
    },
    edicion_nombre: 'Un Nuevo Germinar',
    numero_edicion: 'XV',
    poster_url:
      'https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-xv.webp',
    dias: [
      {
        fecha: '2025-10-03',
        hora_inicio: '11:00',
        hora_fin: '20:00',
        modalidad: 'presencial',
        lugar: {
          nombre: 'Casa Editorial ULS',
          direccion: 'Av. Alberto Solari 1301, La Serena'
        }
      },
      {
        fecha: '2025-10-04',
        hora_inicio: '11:00',
        hora_fin: '20:00',
        modalidad: 'presencial',
        lugar: {
          nombre: 'Casa Editorial ULS',
          direccion: 'Av. Alberto Solari 1301, La Serena'
        }
      }
    ],
    participantes: [
      {
        pseudonimo: 'Akane Ilustración',
        disciplina_slug: 'ilustracion',
        catalogo_slug: 'akane-ilustracion'
      },
      {
        pseudonimo: 'Sol Dibujante',
        disciplina_slug: 'ilustracion',
        catalogo_slug: 'sol-dibujante'
      },
      {
        pseudonimo: 'Manos Que Tejen',
        disciplina_slug: 'manualidades',
        catalogo_slug: null
      },
      {
        pseudonimo: 'Cósmica Cómics',
        disciplina_slug: 'narrativa-grafica',
        catalogo_slug: 'cosmica-comics'
      }
    ],
    actividades: [
      {
        titulo: 'Taller de Acuarela',
        descripcion: 'Aprende técnicas básicas de acuarela',
        duracion_minutos: 90,
        ubicacion: 'Sala 1',
        hora_inicio: '14:00',
        tipo: 'taller',
        fecha: '2025-10-03',
        participante_pseudonimo: 'Akane Ilustración'
      },
      {
        titulo: 'Concierto de Cierre',
        descripcion: 'Presentación musical en vivo',
        duracion_minutos: 60,
        ubicacion: 'Escenario Principal',
        hora_inicio: '18:00',
        tipo: 'musica',
        fecha: '2025-10-04',
        participante_pseudonimo: 'Banda Invitada'
      }
    ]
  },
  'edicion-3-2': {
    edition_id: 3,
    slug: 'edicion-3-2',
    evento: {
      nombre: 'Ilustradores en Benders',
      slug: 'ilustra-benders'
    },
    edicion_nombre: 'Season 3',
    numero_edicion: '3',
    poster_url:
      'https://cdn.frijolmagico.cl/festivales/ilustra-benders/afiche-3.webp',
    dias: [
      {
        fecha: '2025-05-10',
        hora_inicio: '19:00',
        hora_fin: '23:00',
        modalidad: 'presencial',
        lugar: {
          nombre: 'Benders Bar',
          direccion: 'Av. del Mar 2100, La Serena'
        }
      }
    ],
    participantes: [
      {
        pseudonimo: 'Líneas Nocturnas',
        disciplina_slug: 'ilustracion',
        catalogo_slug: 'lineas-nocturnas'
      },
      {
        pseudonimo: 'Trazo Suelto',
        disciplina_slug: 'ilustracion',
        catalogo_slug: null
      }
    ],
    actividades: [
      {
        titulo: 'Live Drawing Session',
        descripcion: 'Sesión de dibujo en vivo con música',
        duracion_minutos: 120,
        ubicacion: 'Benders Bar',
        hora_inicio: '20:00',
        tipo: 'exposicion',
        fecha: '2025-05-10',
        participante_pseudonimo: 'Líneas Nocturnas'
      }
    ]
  }
}

export function getFestivalDetailMock(
  slug: string
): FestivalDetail | undefined {
  return mockDetails[slug]
}
