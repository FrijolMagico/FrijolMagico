import type { FestivalEdicion } from '../../types/festival'

export function getFestivalesMock(): FestivalEdicion[] {
  return [
    // Festival Frijol Mágico XV - 2025
    {
      evento: {
        id: 1,
        nombre: 'Festival Frijol Mágico',
        slug: 'frijol-magico',
        edicion: 'XV',
        edicion_nombre: 'Un Nuevo Germinar',
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
              direccion: 'Av. Alberto Solari 1301, La Serena',
            },
          },
          {
            fecha: '2025-10-04',
            hora_inicio: '11:00',
            hora_fin: '20:00',
            modalidad: 'presencial',
            lugar: {
              nombre: 'Casa Editorial ULS',
              direccion: 'Av. Alberto Solari 1301, La Serena',
            },
          },
        ],
      },
      resumen: {
        total_participantes: {
          exponentes: 42,
          talleres: 6,
          musica: 3,
        },
        por_disciplina: {
          ilustracion: 28,
          manualidades: 10,
          'narrativa-grafica': 4,
        },
      },
    },
    // Ilustradores en Benders 3 - 2025
    {
      evento: {
        id: 2,
        nombre: 'Ilustradores en Benders',
        slug: 'ilustra-benders',
        edicion: '3',
        edicion_nombre: 'Season 3',
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
              direccion: 'Av. del Mar 2100, La Serena',
            },
          },
        ],
      },
      resumen: {
        total_participantes: {
          exponentes: 15,
          talleres: 0,
          musica: 2,
        },
        por_disciplina: {
          ilustracion: 15,
        },
      },
    },
    // Festival Frijol Mágico XIV - 2024
    {
      evento: {
        id: 1,
        nombre: 'Festival Frijol Mágico',
        slug: 'frijol-magico',
        edicion: 'XIV',
        edicion_nombre: null,
        poster_url:
          'https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-xiv.webp',
        dias: [
          {
            fecha: '2024-10-19',
            hora_inicio: '11:00',
            hora_fin: '20:00',
            modalidad: 'presencial',
            lugar: {
              nombre: 'Mall VIVO Coquimbo',
              direccion: 'Av. Costanera 800, Coquimbo',
            },
          },
        ],
      },
      resumen: {
        total_participantes: {
          exponentes: 38,
          talleres: 4,
          musica: 2,
        },
        por_disciplina: {
          ilustracion: 25,
          manualidades: 9,
          'narrativa-grafica': 4,
        },
      },
    },
    // Ilustradores en Benders 2 - 2024
    {
      evento: {
        id: 2,
        nombre: 'Ilustradores en Benders',
        slug: 'ilustra-benders',
        edicion: '2',
        edicion_nombre: 'Season 2',
        poster_url:
          'https://cdn.frijolmagico.cl/festivales/ilustra-benders/afiche-2.webp',
        dias: [
          {
            fecha: '2024-06-15',
            hora_inicio: '19:00',
            hora_fin: '23:00',
            modalidad: 'presencial',
            lugar: {
              nombre: 'Benders Bar',
              direccion: 'Av. del Mar 2100, La Serena',
            },
          },
        ],
      },
      resumen: {
        total_participantes: {
          exponentes: 12,
          talleres: 0,
          musica: 1,
        },
        por_disciplina: {
          ilustracion: 12,
        },
      },
    },
    // Festival Frijol Mágico XIII - 2024
    {
      evento: {
        id: 1,
        nombre: 'Festival Frijol Mágico',
        slug: 'frijol-magico',
        edicion: 'XIII',
        edicion_nombre: null,
        poster_url:
          'https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-xiii.webp',
        dias: [
          {
            fecha: '2024-05-18',
            hora_inicio: '11:00',
            hora_fin: '20:00',
            modalidad: 'presencial',
            lugar: {
              nombre: 'Mall VIVO Coquimbo',
              direccion: 'Av. Costanera 800, Coquimbo',
            },
          },
        ],
      },
      resumen: {
        total_participantes: {
          exponentes: 35,
          talleres: 3,
          musica: 2,
        },
        por_disciplina: {
          ilustracion: 24,
          manualidades: 8,
          'narrativa-grafica': 3,
        },
      },
    },
    // Ilustradores en Benders 1 - 2023
    {
      evento: {
        id: 2,
        nombre: 'Ilustradores en Benders',
        slug: 'ilustra-benders',
        edicion: '1',
        edicion_nombre: null,
        poster_url:
          'https://cdn.frijolmagico.cl/festivales/ilustra-benders/afiche-1.webp',
        dias: [
          {
            fecha: '2023-11-25',
            hora_inicio: '19:00',
            hora_fin: '23:00',
            modalidad: 'presencial',
            lugar: {
              nombre: 'Benders Bar',
              direccion: 'Av. del Mar 2100, La Serena',
            },
          },
        ],
      },
      resumen: {
        total_participantes: {
          exponentes: 10,
          talleres: 0,
          musica: 1,
        },
        por_disciplina: {
          ilustracion: 10,
        },
      },
    },
    // Festival Frijol Mágico XII - 2022
    {
      evento: {
        id: 1,
        nombre: 'Festival Frijol Mágico',
        slug: 'frijol-magico',
        edicion: 'XII',
        edicion_nombre: null,
        poster_url:
          'https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-xii.webp',
        dias: [
          {
            fecha: '2022-04-09',
            hora_inicio: '11:30',
            hora_fin: '20:30',
            modalidad: 'presencial',
            lugar: {
              nombre: 'Centro Cultural Santa Inés',
              direccion: 'Almagro #232, La Serena',
            },
          },
        ],
      },
      resumen: {
        total_participantes: {
          exponentes: 45,
          talleres: 3,
          musica: 2,
        },
        por_disciplina: {
          ilustracion: 35,
          manualidades: 10,
        },
      },
    },
    // Festival Frijol Mágico XI - 2021 (Online)
    {
      evento: {
        id: 1,
        nombre: 'Festival Frijol Mágico',
        slug: 'frijol-magico',
        edicion: 'XI',
        edicion_nombre: 'Edición Virtual',
        poster_url:
          'https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-xi.webp',
        dias: [
          {
            fecha: '2021-04-16',
            hora_inicio: '15:00',
            hora_fin: '21:00',
            modalidad: 'online',
            lugar: null,
          },
          {
            fecha: '2021-04-17',
            hora_inicio: '15:00',
            hora_fin: '21:00',
            modalidad: 'online',
            lugar: null,
          },
          {
            fecha: '2021-04-18',
            hora_inicio: '15:00',
            hora_fin: '21:00',
            modalidad: 'online',
            lugar: null,
          },
        ],
      },
      resumen: {
        total_participantes: {
          exponentes: 30,
          talleres: 8,
          musica: 4,
        },
        por_disciplina: {
          ilustracion: 25,
          manualidades: 5,
        },
      },
    },
    // Festival Frijol Mágico X - 2020
    {
      evento: {
        id: 1,
        nombre: 'Festival Frijol Mágico',
        slug: 'frijol-magico',
        edicion: 'X',
        edicion_nombre: 'Décimo Aniversario',
        poster_url:
          'https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-x.webp',
        dias: [
          {
            fecha: '2020-02-28',
            hora_inicio: '11:30',
            hora_fin: '20:30',
            modalidad: 'presencial',
            lugar: {
              nombre: 'Centro Cultural Santa Inés',
              direccion: 'Almagro #232, La Serena',
            },
          },
          {
            fecha: '2020-02-29',
            hora_inicio: '11:30',
            hora_fin: '20:30',
            modalidad: 'presencial',
            lugar: {
              nombre: 'Centro Cultural Santa Inés',
              direccion: 'Almagro #232, La Serena',
            },
          },
        ],
      },
      resumen: {
        total_participantes: {
          exponentes: 61,
          talleres: 5,
          musica: 3,
        },
        por_disciplina: {
          ilustracion: 51,
          manualidades: 10,
        },
      },
    },
  ]
}
